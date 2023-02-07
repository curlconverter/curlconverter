import parser from "./bash-parser.js";
import type { Parser } from "./bash-parser.js";

import { Word, eq, firstShellToken, mergeWords, joinWords } from "./word.js";
import type { Token, ShellToken } from "./word.js";

import {
  curlLongOpts,
  curlShortOpts,
  changedShortOpts,
  toBoolean,
} from "./curlopts.js";
import type { LongOpts, ShortOpts } from "./curlopts.js";

export class CCError extends Error {}

// Note: !has() will lead to type errors
// TODO: replace with Object.hasOwn() once Node 16 is EOL'd on 2023-09-11
function has<T, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function pushProp<Type>(
  obj: { [key: string]: Type[] },
  prop: string,
  value: Type
) {
  if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
    obj[prop] = [];
  }
  obj[prop].push(value);
  return obj;
}

function isInt(s: string): boolean {
  return /^\s*[+-]?\d+$/.test(s);
}

type QueryList = Array<[Word, Word]>;
type QueryDict = Array<[Word, Word | Array<Word>]>;

type Headers = Array<[Word, Word | null]>;

type Cookie = [Word, Word];
type Cookies = Array<Cookie>;

type FormType = "string" | "form";
type SrcFormParam = { value: Word; type: FormType };
// contentFile is the file to read the content from
// filename is the name of the file to send to the server
type FormParam = {
  name: Word;
} & ({ content: Word } | { contentFile: Word; filename?: Word });

type FileParamType = "string" | "binary" | "urlencode" | "json";
type DataType = FileParamType | "raw";

type SrcDataParam = [DataType, Word];

type FileDataParam = [FileParamType, Word | null, Word];
// "raw"-type SrcDataParams, and `FileParamType`s that read from stdin
// when we have its contents (because it comes from a pipe) are converted
// to plain strings
type DataParam = Word | FileDataParam;

// The keys should be named the same as the curl options that
// set them because they appear in error messages.
interface OperationConfig {
  request?: Word; // the HTTP method

  // Not the same name as the curl options that set it
  authtype: number;
  authArgs?: [string, boolean][];

  json?: boolean;

  // canBeList
  url?: Word[]; // TODO: support Bash variables in URL
  "upload-file"?: Word[];
  output?: Word[];
  header?: Word[];
  "proxy-header"?: Word[];
  form?: SrcFormParam[];
  data?: SrcDataParam[];
  "url-query"?: SrcDataParam[];
  "mail-rcpt"?: Word[];
  resolve?: Word[];
  "connect-to"?: Word[];
  cookie?: Word[];
  quote?: Word[];
  "telnet-option"?: Word[];

  http2?: boolean;
  http3?: boolean;

  insecure?: boolean;
  compressed?: boolean;

  head?: boolean;
  get?: boolean;

  cacert?: Word;
  capath?: Word;
  cert?: Word;
  key?: Word;

  "proto-default"?: Word;
  globoff?: boolean;

  "max-redirs"?: Word;
  location?: boolean;
  "location-trusted"?: boolean;

  proxy?: Word;
  "proxy-user"?: Word;

  range?: Word;
  referer?: Word;
  "time-cond"?: Word;
  "user-agent"?: Word;

  user?: Word;
  "aws-sigv4"?: Word;
  delegation?: Word;
  "oauth2-bearer"?: Word;

  "max-time"?: Word;
  "connect-timeout"?: Word;

  "cookie-jar"?: Word;

  // TODO: list every argument
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
// These options can be specified more than once, they
// are always returned as a list.
// Normally, if you specify some option more than once,
// curl will just take the last one.
const canBeList = new Set<keyof OperationConfig>([
  "url",
  "upload-file",
  "output",
  "header",
  "proxy-header",
  "form",
  "data",
  "url-query",
  "mail-rcpt",
  "resolve",
  "connect-to",
  "cookie",
  "quote",
  "telnet-option",

  "authArgs", // used for error messages
]);

type Warnings = [string, string][];

interface GlobalConfig {
  verbose?: boolean;
  help?: boolean;
  version?: boolean;

  configs: OperationConfig[];
  warnings: Warnings;

  // These are specific to the curlconverter cli
  language?: string;
  stdin?: boolean;
}

function warnf(global: GlobalConfig, warning: [string, string]) {
  global.warnings.push(warning);
}

const CURLAUTH_BASIC = 1 << 0;
const CURLAUTH_DIGEST = 1 << 1;
const CURLAUTH_NEGOTIATE = 1 << 2;
const CURLAUTH_NTLM = 1 << 3;
const CURLAUTH_DIGEST_IE = 1 << 4;
const CURLAUTH_NTLM_WB = 1 << 5;
const CURLAUTH_BEARER = 1 << 6;
const CURLAUTH_AWS_SIGV4 = 1 << 7;
const CURLAUTH_ANY = ~CURLAUTH_DIGEST_IE;

// This is this function
// https://github.com/curl/curl/blob/curl-7_86_0/lib/http.c#L455
// which is not the correct function, since it works on the response.
//
// Curl also filters out auth schemes it doesn't support,
// https://github.com/curl/curl/blob/curl-7_86_0/lib/setopt.c#L970
// but we support all of them, so we don't need to do that.
function pickAuth(mask: number): AuthType {
  if (mask === CURLAUTH_ANY) {
    return "basic";
  }

  const auths: [number, AuthType][] = [
    [CURLAUTH_NEGOTIATE, "negotiate"],
    [CURLAUTH_BEARER, "bearer"],
    [CURLAUTH_DIGEST, "digest"],
    [CURLAUTH_NTLM, "ntlm"],
    [CURLAUTH_NTLM_WB, "ntlm-wb"],
    [CURLAUTH_BASIC, "basic"],
    // This check happens outside this function because we obviously
    // don't need to to specify --no-basic to use aws-sigv4
    // https://github.com/curl/curl/blob/curl-7_86_0/lib/setopt.c#L678-L679
    [CURLAUTH_AWS_SIGV4, "aws-sigv4"],
  ];
  for (const [auth, authName] of auths) {
    if (mask & auth) {
      return authName;
    }
  }
  return "none";
}

function pushArgValue(
  global: GlobalConfig,
  config: OperationConfig,
  argName: string,
  value: string | Word
) {
  // Note: cli.ts assumes that the property names on OperationConfig
  // are the same as the passed in argument in an error message, so
  // if you do something like
  // echo curl example.com | curlconverter - --data-raw foo
  // The error message will say
  // "if you pass --stdin or -, you can't also pass --data"
  // instead of "--data-raw".
  switch (argName) {
    case "data":
    case "data-ascii":
      return pushProp(config, "data", ["data", value]);
    case "data-binary":
      return pushProp(config, "data", [
        // Unless it's a file, --data-binary works the same as --data
        value.startsWith("@") ? "binary" : "data",
        value,
      ]);
    case "data-raw":
      return pushProp(config, "data", [
        // Unless it's a file, --data-raw works the same as --data
        value.startsWith("@") ? "raw" : "data",
        value,
      ]);
    case "data-urlencode":
      return pushProp(config, "data", ["urlencode", value]);
    case "json":
      config.json = true;
      return pushProp(config, "data", ["json", value]);
    case "url-query":
      if (value.startsWith("+")) {
        return pushProp(config, "url-query", ["raw", value.slice(1)]);
      }
      return pushProp(config, "url-query", ["urlencode", value]);

    case "form":
      return pushProp(config, "form", { value, type: "form" });
    case "form-string":
      return pushProp(config, "form", { value, type: "string" });

    case "aws-sigv4":
      pushProp(config, "authArgs", [argName, true]); // error reporting
      config.authtype |= CURLAUTH_AWS_SIGV4;
      break;
    case "oauth2-bearer":
      pushProp(config, "authArgs", [argName, true]); // error reporting
      config.authtype |= CURLAUTH_BEARER;
      break;

    case "language": // --language is a curlconverter specific option
      global[argName] = value.toString();
      return;
  }

  return pushProp(config, argName, value);
}

function setArgValue(
  global: GlobalConfig,
  config: OperationConfig,
  argName: string,
  toggle: boolean
) {
  switch (argName) {
    case "digest":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
      if (toggle) {
        config.authtype |= CURLAUTH_DIGEST;
      } else {
        config.authtype &= ~CURLAUTH_DIGEST;
      }
      break;
    case "negotiate":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
      if (toggle) {
        config.authtype |= CURLAUTH_NEGOTIATE;
      } else {
        config.authtype &= ~CURLAUTH_NEGOTIATE;
      }
      break;
    case "ntlm":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
      if (toggle) {
        config.authtype |= CURLAUTH_NTLM;
      } else {
        config.authtype &= ~CURLAUTH_NTLM;
      }
      break;
    case "ntlm-wb":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
      if (toggle) {
        config.authtype |= CURLAUTH_NTLM_WB;
      } else {
        config.authtype &= ~CURLAUTH_NTLM_WB;
      }
      break;
    case "basic":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
      if (toggle) {
        config.authtype |= CURLAUTH_BASIC;
      } else {
        config.authtype &= ~CURLAUTH_BASIC;
      }
      break;
    case "anyauth":
      pushProp(config, "authArgs", [argName, toggle]); // error reporting
      if (toggle) {
        config.authtype = CURLAUTH_ANY;
      }
      break;
    case "location":
      config["location"] = toggle;
      break;
    case "location-trusted":
      config["location"] = toggle;
      config["location-trusted"] = toggle;
      break;
    case "verbose":
    case "version":
    case "help":
    case "stdin": // --stdin or - is a curlconverter specific option
      global[argName] = toggle;
      break;
    case "next":
      // curl ignores --next if the last url node doesn't have a url
      if (
        toggle &&
        config.url &&
        config.url.length > 0 &&
        config.url.length >= (config["upload-file"] || []).length &&
        config.url.length >= (config.output || []).length
      ) {
        config = { authtype: CURLAUTH_BASIC };
        global.configs.push(config);
      }
      break;
    default:
      config[argName] = toggle;
  }
  return config;
}

// Arguments which are supported by all generators, because they're
// already handled in util.ts or because they're easy to implement
const COMMON_SUPPORTED_ARGS: string[] = [
  "url",
  "proto-default",
  // Method
  "request",
  "get",
  "head",
  "no-head",
  // Headers
  "header", // TODO: can be a file
  "user-agent",
  "referer",
  "range",
  "time-cond",
  "cookie", // TODO: can be a file
  "oauth2-bearer",
  // Basic Auth
  "user",
  "basic",
  "no-basic",
  // Data
  "data",
  "data-raw",
  "data-ascii",
  "data-binary",
  "data-urlencode",
  "json",
  "url-query",

  // Trivial support for globoff means controlling whether or not
  // backslash-escaped [] {} will have the backslash removed.
  "globoff",
];

// Unsupported args that users wouldn't expect to be warned about
const ignoredArgs = new Set([
  "help",
  "no-help",
  "silent",
  "no-silent",
  "verbose",
  "no-verbose",
  "version",
  "no-version",
  "progress-bar",
  "no-progress-bar",
  "progress-meter",
  "no-progress-meter",
  "show-error",
  "no-show-error",
]);

type AuthType =
  | "basic"
  | "digest"
  | "ntlm"
  | "ntlm-wb"
  | "negotiate"
  | "bearer"
  | "aws-sigv4"
  | "none";

// https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L60
interface Curl_URL {
  scheme: Word;

  auth?: Word;
  user?: Word;
  password?: Word;

  // options: string /* IMAP only? */;
  host: Word;
  // zoneid: string /* for numerical IPv6 addresses */;
  // port: string;
  path: Word;
  query: Word;
  originalQuery: Word;
  fragment: Word;
  // portnum: number /* the numerical version */;
}
// struct getout
// https://github.com/curl/curl/blob/curl-7_86_0/src/tool_sdecls.h#L96
// and
// struct urlpieces
// https://github.com/curl/curl/blob/curl-7_86_0/lib/urldata.h#L1336
interface RequestUrl {
  // The url exactly as it was passed in, used for error messages
  originalUrl: Word;
  url: Word;
  // the query string can contain instructions to
  // read the query string from a file, for example with
  // --url-query @filename
  // In that case we put "@filename" in the query string and "filename" here and
  // warn the user that they'll need to modify the code to read that file.
  queryReadsFile?: string;

  urlObj: Curl_URL;

  // If the ?query can't be losslessly parsed, then
  // .urlWithoutQueryList === .url
  // .queryList           === undefined
  urlWithoutQueryList: Word;
  queryList?: QueryList;
  // When all repeated keys in queryList happen one after the other
  // ?a=1&a=1&b=2 (okay)
  // ?a=1&b=2&a=1 (doesn't work, queryList is defined but queryDict isn't)
  queryDict?: QueryDict;

  urlWithoutQueryArray: Word;
  urlWithOriginalQuery: Word;
  // This includes the query in the URL and the query that comes from `--get --data` or `--url-query`
  queryArray?: DataParam[];
  // This is only the query in the URL
  urlQueryArray?: DataParam[];
  uploadFile?: Word;
  output?: Word;

  method: Word;
  auth?: [Word, Word];
  // TODO: should authType be per-url as well?
  // authType?: string;
}

interface Request {
  // Will have at least one element (otherwise an error is raised)
  urls: RequestUrl[];

  // Just the part that comes from `--get --data` or `--url-query` (not the query in the URL)
  // unless there's only one URL, then it will include both.
  queryArray?: DataParam[];

  authType: AuthType;
  awsSigV4?: Word;
  delegation?: Word;

  // A null header means the command explicitly disabled sending this header
  headers?: Headers;
  lowercaseHeaders: boolean;

  // .cookies is a parsed version of the Cookie header, if it can be parsed.
  // Generators that use .cookies need to delete the header from .headers (usually).
  cookies?: Cookies;
  cookieFiles?: Word[];
  cookieJar?: Word;

  compressed?: boolean;
  insecure?: boolean;

  multipartUploads?: FormParam[];

  dataArray?: DataParam[];
  data?: Word;
  dataReadsFile?: string;
  isDataBinary?: boolean;
  isDataRaw?: boolean;

  cert?: Word | [Word, Word];
  cacert?: Word;
  capath?: Word;

  proxy?: Word;
  proxyAuth?: Word;

  timeout?: Word;
  connectTimeout?: Word;

  followRedirects?: boolean;
  followRedirectsTrusted?: boolean;
  maxRedirects?: Word;

  http2?: boolean;
  http3?: boolean;

  stdin?: Word; // TODO: this should be a Word too
  stdinFile?: Word;
}

const BACKSLASHES = /\\./gs;
const removeBackslash = (m: string) =>
  m.charAt(1) === "\n" ? "" : m.charAt(1);
const removeBackslashes = (str: string): string => {
  return str.replace(BACKSLASHES, removeBackslash);
};
// https://www.gnu.org/software/bash/manual/bash.html#Double-Quotes
const DOUBLE_QUOTE_BACKSLASHES = /\\[\\$`"\n]/gs;
const removeDoubleQuoteBackslashes = (str: string): string => {
  return str.replace(DOUBLE_QUOTE_BACKSLASHES, removeBackslash);
};
// ANSI-C quoted strings look $'like this'.
// Not all shells have them but Bash does
// https://www.gnu.org/software/bash/manual/html_node/ANSI_002dC-Quoting.html
//
// https://git.savannah.gnu.org/cgit/bash.git/tree/lib/sh/strtrans.c
const ANSI_BACKSLASHES =
  /\\(\\|a|b|e|E|f|n|r|t|v|'|"|\?|[0-7]{1,3}|x[0-9A-Fa-f]{1,2}|u[0-9A-Fa-f]{1,4}|U[0-9A-Fa-f]{1,8}|c.)/gs;
const removeAnsiCBackslashes = (str: string): string => {
  const unescapeChar = (m: string) => {
    switch (m.charAt(1)) {
      case "\\":
        return "\\";
      case "a":
        return "\x07";
      case "b":
        return "\b";
      case "e":
      case "E":
        return "\x1B";
      case "f":
        return "\f";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "v":
        return "\v";
      case "'":
        return "'";
      case '"':
        return '"';
      case "?":
        return "?";
      case "c":
        // Bash handles all characters by considering the first byte
        // of its UTF-8 input and can produce invalid UTF-8, whereas
        // JavaScript stores strings in UTF-16
        if (m.codePointAt(2)! > 127) {
          throw new CCError(
            'non-ASCII control character in ANSI-C quoted string: "\\u{' +
              m.codePointAt(2)!.toString(16) +
              '}"'
          );
        }
        // If this produces a 0x00 (null) character, it will cause bash to
        // terminate the string at that character, but we return the null
        // character in the result.
        return m[2] === "?"
          ? "\x7F"
          : String.fromCodePoint(
              m[2].toUpperCase().codePointAt(0)! & 0b00011111
            );
      case "x":
      case "u":
      case "U":
        // Hexadecimal character literal
        // Unlike bash, this will error if the the code point is greater than 10FFFF
        return String.fromCodePoint(parseInt(m.slice(2), 16));
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
        // Octal character literal
        return String.fromCodePoint(parseInt(m.slice(1), 8) % 256);
      default:
        // There must be a mis-match between ANSI_BACKSLASHES and the switch statement
        throw new CCError(
          "unhandled character in ANSI-C escape code: " + JSON.stringify(m)
        );
    }
  };

  return str.replace(ANSI_BACKSLASHES, unescapeChar);
};

const underlineNode = (
  node: Parser.SyntaxNode,
  curlCommand?: string
): string => {
  // TODO: If this needs to be desirialized, it would be more efficient
  // to pass the original command as a string.
  curlCommand = node.tree.rootNode.text;

  // TODO: is this exactly how tree-sitter splits lines?
  const line = curlCommand.split("\n")[node.startPosition.row];
  const onOneLine = node.endPosition.row === node.startPosition.row;
  const end = onOneLine ? node.endPosition.column : line.length;
  return (
    `${line}\n` +
    " ".repeat(node.startPosition.column) +
    "^".repeat(end - node.startPosition.column) +
    (onOneLine ? "" : "^") // TODO: something else?
  );
};

const underlineNodeEnd = (
  node: Parser.SyntaxNode,
  curlCommand?: string
): string => {
  curlCommand = node.tree.rootNode.text;

  // TODO: is this exactly how tree-sitter splits lines?
  const line = curlCommand.split("\n")[node.endPosition.row];
  const onOneLine = node.endPosition.row === node.startPosition.row;
  const start = onOneLine ? node.startPosition.column : 0;
  // TODO: cut off line if it's too long
  return `${line}\n` + " ".repeat(start) + "^".repeat(node.endPosition.column);
};

function toTokens(
  node: Parser.SyntaxNode,
  curlCommand: string,
  warnings: Warnings
): Token[] {
  let vals: Token[] = [];
  switch (node.type) {
    case "word":
      return [removeBackslashes(node.text)];
    case "raw_string":
      return [node.text.slice(1, -1)];
    case "ansii_c_string":
      return [removeAnsiCBackslashes(node.text.slice(2, -1))];
    case "string":
    case "string_expansion": {
      // TODO: MISSING quotes, for example
      // curl "example.com
      let prevEnd = node.type === "string" ? 1 : 2;

      let res = "";
      for (const child of node.namedChildren) {
        res += removeDoubleQuoteBackslashes(
          node.text.slice(prevEnd, child.startIndex - node.startIndex)
        );
        // expansion, simple_expansion or command_substitution (or concat?)
        const subVal = toTokens(child, curlCommand, warnings);
        if (typeof subVal === "string") {
          res += subVal;
        } else {
          if (res) {
            vals.push(res);
            res = "";
          }
          vals = vals.concat(subVal);
        }
        prevEnd = child.endIndex - node.startIndex;
      }
      res += removeDoubleQuoteBackslashes(node.text.slice(prevEnd, -1));
      if (res || vals.length === 0) {
        vals.push(res);
      }
      return vals;
    }
    case "simple_expansion":
      // TODO: handle variables downstream
      // '$' + variable_name or special_variable_name
      warnings.push([
        "expansion",
        "found shell environment variable\n" + underlineNode(node, curlCommand),
      ]);
      if (
        node.firstNamedChild &&
        node.firstNamedChild.type === "special_variable_name"
      ) {
        // https://www.gnu.org/software/bash/manual/bash.html#Special-Parameters
        // TODO: warning isn't printed
        warnings.push([
          "special_variable_name",
          node.text +
            " is a special Bash variable\n" +
            underlineNode(node.firstNamedChild, curlCommand),
        ]);
      }
      return [
        {
          type: "variable",
          value: node.text.slice(1),
          text: node.text,
          syntaxNode: node,
        },
      ];
    case "expansion":
      // Expansions look ${like_this}
      // https://www.gnu.org/software/bash/manual/bash.html#Shell-Parameter-Expansion
      // TODO: MISSING }, for example
      // curl example${com
      warnings.push([
        "expansion",
        "found expansion expression\n" + underlineNode(node, curlCommand),
      ]);
      // variable_name or subscript or no child
      // TODO: handle substitutions
      return [
        {
          type: "variable",
          value: node.text.slice(2, -1),
          text: node.text,
          syntaxNode: node,
        },
      ];
    case "command_substitution":
      // TODO: MISSING ), for example
      // curl example$(com
      warnings.push([
        "expansion",
        "found command substitution expression\n" +
          underlineNode(node, curlCommand),
      ]);
      return [
        {
          type: "command",
          // TODO: further tokenize and pass an array of args
          // to subprocess.run() or a command name + string args to C#
          value: node.text.slice(node.text.startsWith("$(") ? 2 : 1, -1),
          text: node.text,
          syntaxNode: node,
        },
      ];
    case "concatenation": {
      // item[]=1 turns into item=1 if we don't do this
      // https://github.com/tree-sitter/tree-sitter-bash/issues/104
      let prevEnd = 0;
      let res = "";
      for (const child of node.children) {
        // TODO: removeBackslashes()?
        // Can we get anything other than []{} characters here?
        res += node.text.slice(prevEnd, child.startIndex - node.startIndex);
        prevEnd = child.endIndex - node.startIndex;

        const subVal = toTokens(child, curlCommand, warnings);
        if (typeof subVal === "string") {
          res += subVal;
        } else {
          if (res) {
            vals.push(res);
            res = "";
          }
          vals = vals.concat(subVal);
        }
      }
      res += node.text.slice(prevEnd);
      if (res || vals.length === 0) {
        vals.push(res);
      }
      return vals;
    }
    default:
      throw new CCError(
        "unexpected argument type " +
          JSON.stringify(node.type) +
          '. Must be one of "word", "string", "raw_string", "ansii_c_string", "expansion", "simple_expansion", "string_expansion" or "concatenation"\n' +
          underlineNode(node, curlCommand)
      );
  }
}

function toWord(
  node: Parser.SyntaxNode,
  curlCommand: string,
  warnings: Warnings
): Word {
  return new Word(toTokens(node, curlCommand, warnings));
}

interface TokenizeResult {
  cmdName: string;
  args: Word[];
  stdin?: Word;
  stdinFile?: Word;
}
const tokenize = (
  curlCommand: string,
  warnings: Warnings = []
): TokenizeResult => {
  const ast = parser.parse(curlCommand);
  // https://github.com/tree-sitter/tree-sitter-bash/blob/master/grammar.js
  // The AST must be in a nice format, i.e.
  // (program
  //   (command
  //     name: (command_name (word))
  //     argument+: (
  //       word |
  //       "string" |
  //       'raw_string' |
  //       $'ansii_c_string' |
  //       $"string_expansion" |
  //       ${expansion} |
  //       $simple_expansion |
  //       concatenation)))
  // or
  // (program
  //   (redirected_statement
  //     body: (command, same as above)
  //     redirect))
  // TODO: support prefixed variables, e.g. "MY_VAR=hello curl example.com"
  // TODO: get only named children?
  if (ast.rootNode.type !== "program") {
    // TODO: better error message.
    throw new CCError(
      'expected a "program" top-level AST node, got ' +
        ast.rootNode.type +
        " instead"
    );
  }

  if (ast.rootNode.childCount < 1 || !ast.rootNode.children) {
    // TODO: better error message.
    throw new CCError('empty "program" node');
  }

  // Get the curl call AST node. Skip comments
  let command, lastNode, stdin, stdinFile;
  for (const n of ast.rootNode.children) {
    if (n.type === "comment") {
      continue;
    } else if (n.type === "command") {
      command = n;
      lastNode = n;
      break;
    } else if (n.type === "redirected_statement") {
      if (!n.childCount) {
        throw new CCError('got empty "redirected_statement" AST node');
      }
      let redirects;
      [command, ...redirects] = n.namedChildren;
      lastNode = n;
      if (command.type !== "command") {
        throw new CCError(
          'got "redirected_statement" AST node whose first child is not a "command", got ' +
            command.type +
            " instead\n" +
            underlineNode(command, curlCommand)
        );
      }
      if (n.childCount < 2) {
        throw new CCError(
          'got "redirected_statement" AST node with only one child - no redirect'
        );
      }
      if (redirects.length > 1) {
        warnings.push([
          "multiple-redirects",
          // TODO: only the Python generator uses the redirect so this is misleading.
          "found " +
            redirects.length +
            " redirect nodes. Only the first one will be used:\n" +
            underlineNode(redirects[1], curlCommand),
        ]);
      }
      const redirect = redirects[0];
      if (redirect.type === "file_redirect") {
        stdinFile = toWord(redirect.namedChildren[0], curlCommand, warnings);
      } else if (redirect.type === "heredoc_redirect") {
        // heredoc bodies are children of the parent program node
        // https://github.com/tree-sitter/tree-sitter-bash/issues/118
        if (redirect.namedChildCount < 1) {
          throw new CCError(
            'got "redirected_statement" AST node with heredoc but no heredoc start'
          );
        }
        const heredocStart = redirect.namedChildren[0].text;
        const heredocBody = n.nextNamedSibling;
        lastNode = heredocBody;
        if (!heredocBody) {
          throw new CCError(
            'got "redirected_statement" AST node with no heredoc body'
          );
        }
        // TODO: herestrings and heredocs are different
        if (heredocBody.type !== "heredoc_body") {
          throw new CCError(
            'got "redirected_statement" AST node with heredoc but no heredoc body, got ' +
              heredocBody.type +
              " instead"
          );
        }
        // TODO: heredocs do variable expansion and stuff
        if (heredocStart.length) {
          stdin = new Word([heredocBody.text.slice(0, -heredocStart.length)]);
        } else {
          // this shouldn't happen
          stdin = new Word([heredocBody.text]);
        }
      } else if (redirect.type === "herestring_redirect") {
        if (redirect.namedChildCount < 1 || !redirect.firstNamedChild) {
          throw new CCError(
            'got "redirected_statement" AST node with empty herestring'
          );
        }
        // TODO: this just converts bash code to text
        stdin = new Word([redirect.firstNamedChild.text]);
      } else {
        throw new CCError(
          'got "redirected_statement" AST node whose second child is not one of "file_redirect", "heredoc_redirect" or "herestring_redirect", got ' +
            command.type +
            " instead"
        );
      }

      break;
    } else if (n.type === "ERROR") {
      throw new CCError(
        `Bash parsing error on line ${n.startPosition.row + 1}:\n` +
          underlineNode(n, curlCommand)
      );
    } else {
      // TODO: better error message.
      throw new CCError(
        'expected a "command" or "redirected_statement" AST node, instead got ' +
          ast.rootNode.children[0].type +
          "\n" +
          underlineNode(ast.rootNode.children[0], curlCommand)
      );
    }
  }
  // TODO: better logic, skip comments.
  if (lastNode && lastNode.nextNamedSibling) {
    // TODO: better wording
    warnings.push([
      "extra-commands",
      `curl command ends on line ${
        lastNode.endPosition.row + 1
      }, everything after this is ignored:\n` +
        underlineNodeEnd(lastNode, curlCommand),
    ]);

    const curlCommandLines = curlCommand.split("\n");
    const lastNodeLine = curlCommandLines[lastNode.endPosition.row];
    const impromperBackslash = lastNodeLine.match(/\\\s+$/);
    if (
      impromperBackslash &&
      curlCommandLines.length > lastNode.endPosition.row + 1 &&
      impromperBackslash.index !== undefined
    ) {
      warnings.push([
        "unescaped-newline",
        "The trailling '\\' on line " +
          (lastNode.endPosition.row + 1) +
          " is followed by whitespace, so it won't escape the newline after it:\n" +
          // TODO: cut off line if it's very long?
          lastNodeLine +
          "\n" +
          " ".repeat(impromperBackslash.index) +
          "^".repeat(impromperBackslash[0].length),
      ]);
    }
  }
  if (!command) {
    // NOTE: if you add more node types in the `for` loop above, this error needs to be updated.
    // We would probably need to keep track of the node types we've seen.
    throw new CCError(
      'expected a "command" or "redirected_statement" AST node, only found "comment" nodes'
    );
  }
  for (const n of ast.rootNode.children) {
    if (n.type === "ERROR") {
      warnings.push([
        "bash",
        `Bash parsing error on line ${n.startPosition.row + 1}:\n` +
          underlineNode(n, curlCommand),
      ]);
    }
  }

  if (command.childCount < 1) {
    // TODO: better error message.
    throw new CCError('empty "command" node');
  }
  // TODO: add childrenForFieldName to tree-sitter node/web bindings
  const commandChildren = command.namedChildren;
  let commandNameLoc = 0;
  // skip over variable_assignment and file_redirect, until we get to the command_name
  for (const n of commandChildren) {
    if (n.type === "variable_assignment" || n.type === "file_redirect") {
      warnings.push([
        "command-preamble",
        "skipping " +
          JSON.stringify(n.type) +
          " expression\n" +
          underlineNode(n, curlCommand),
      ]);
      commandNameLoc += 1;
    } else {
      break;
    }
  }
  const [cmdName, ...args] = command.namedChildren.slice(commandNameLoc);
  if (cmdName.type !== "command_name") {
    throw new CCError(
      'expected a "command_name" AST node, found ' +
        cmdName.type +
        " instead\n" +
        underlineNode(cmdName, curlCommand)
    );
  }
  if (cmdName.childCount < 1) {
    throw new CCError(
      'found empty "command_name" AST node\n' +
        underlineNode(cmdName, curlCommand)
    );
  }

  const cmdNameNode = toWord(cmdName.firstChild!, curlCommand, warnings);

  const cmdNameShellToken = firstShellToken(cmdNameNode);
  // The most common reason for the error below is probably accidentally copying
  // a $ from the shell prompt without a space after it
  let cmdNameStr = cmdNameNode.toString();
  if (cmdNameStr === "$curl") {
    cmdNameStr = "curl";
  } else if (cmdNameShellToken) {
    // TODO: just assume it evaluates to "curl"?
    throw new CCError(
      "expected command name to be a simple value but found an expression\n" +
        // TODO: hightlight the expression within the name node
        underlineNode(cmdNameShellToken.syntaxNode, curlCommand)
    );
  }
  const argsNodes = args.map((a: Parser.SyntaxNode) =>
    toWord(a, curlCommand, warnings)
  );
  return {
    cmdName: cmdNameStr,
    args: argsNodes,
    stdin,
    stdinFile,
  };
};

const checkLongOpt = (
  lookup: string,
  longArgName: string,
  supportedOpts: Set<string>,
  global: GlobalConfig
) => {
  if (!supportedOpts.has(longArgName) && !ignoredArgs.has(longArgName)) {
    // TODO: better message. include generator name?
    warnf(global, [longArgName, "--" + lookup + " is not a supported option"]);
  }
};

const checkShortOpt = (
  lookup: string,
  longArgName: string,
  supportedOpts: Set<string>,
  global: GlobalConfig
) => {
  if (!supportedOpts.has(longArgName) && !ignoredArgs.has(longArgName)) {
    // TODO: better message. include generator name?
    warnf(global, [longArgName, "-" + lookup + " is not a supported option"]);
  }
};

const parseArgs = (
  args: Word[],
  longOpts: LongOpts,
  shortOpts: ShortOpts,
  supportedOpts?: Set<string>,
  warnings: Warnings = []
): GlobalConfig => {
  let config: OperationConfig = { authtype: CURLAUTH_BASIC };
  const global: GlobalConfig = { configs: [config], warnings };
  for (let i = 0, stillflags = true; i < args.length; i++) {
    const arg: Word = args[i];
    if (stillflags && arg.startsWith("-")) {
      if (eq(arg, "--")) {
        /* This indicates the end of the flags and thus enables the
           following (URL) argument to start with -. */
        stillflags = false;
      } else if (arg.startsWith("--")) {
        const shellToken = firstShellToken(arg);
        if (shellToken) {
          // TODO: if there's any text after the "--" or after the variable
          // we could narrow it down.
          throw new CCError(
            "this " +
              shellToken.type +
              " could " +
              (shellToken.type === "command" ? "return" : "be") +
              " anything\n" +
              underlineNode(shellToken.syntaxNode)
          );
        }
        const argStr = arg.toString();

        const lookup = argStr.slice(2);
        const longArg = longOpts[lookup];
        if (longArg === null) {
          throw new CCError("option " + argStr + ": is ambiguous");
        }
        if (typeof longArg === "undefined") {
          // TODO: extract a list of deleted arguments to check here
          throw new CCError("option " + argStr + ": is unknown");
        }

        if (longArg.type === "string") {
          i++;
          if (i >= args.length) {
            throw new CCError("option " + argStr + ": requires parameter");
          }
          pushArgValue(global, config, longArg.name, args[i]);
        } else {
          config = setArgValue(
            global,
            config,
            longArg.name,
            toBoolean(argStr.slice(2))
          ); // TODO: all shortened args work correctly?
        }
        if (supportedOpts) {
          checkLongOpt(lookup, longArg.name, supportedOpts, global);
        }
      } else {
        // Short option. These can look like
        // -X POST    -> {request: 'POST'}
        // or
        // -XPOST     -> {request: 'POST'}
        // or multiple options
        // -ABCX POST -> {A: true, B: true, C: true, request: 'POST'}
        // or multiple options and a value for the last one
        // -ABCXPOST  -> {A: true, B: true, C: true, request: 'POST'}

        // "-" passed to curl as an argument raises an error,
        // curlconverter's command line uses it to read from stdin
        if (arg.length === 1) {
          if (Object.prototype.hasOwnProperty.call(shortOpts, "")) {
            const shortFor: string = shortOpts[""];
            const longArg = longOpts[shortFor];
            if (longArg === null) {
              throw new CCError("option -: is unknown");
            }
            config = setArgValue(
              global,
              config,
              longArg.name,
              toBoolean(shortFor)
            );
          } else {
            throw new CCError("option -: is unknown");
          }
        }

        for (let j = 1; j < arg.length; j++) {
          const jthChar = arg.get(j);
          if (typeof jthChar !== "string") {
            // A bash variable in the middle of a short option
            throw new CCError(
              "this " +
                jthChar.type +
                " could " +
                (jthChar.type === "command" ? "return" : "be") +
                " anything\n" +
                underlineNode(jthChar.syntaxNode)
            );
          }
          if (!has(shortOpts, jthChar)) {
            if (has(changedShortOpts, jthChar)) {
              throw new CCError(
                "option " + arg + ": " + changedShortOpts[jthChar]
              );
            }
            // TODO: there are a few deleted short options we could report
            throw new CCError("option " + arg + ": is unknown");
          }
          const lookup = jthChar;
          const shortFor = shortOpts[lookup];
          const longArg = longOpts[shortFor];
          if (longArg === null) {
            // This could happen if curlShortOpts points to a renamed option or has a typo
            throw new CCError("ambiguous short option -" + jthChar);
          }
          if (longArg.type === "string") {
            let val;
            if (j + 1 < arg.length) {
              // treat -XPOST as -X POST
              val = arg.slice(j + 1);
              j = arg.length;
            } else if (i + 1 < args.length) {
              i++;
              val = args[i];
            } else {
              throw new CCError(
                "option " + arg.toString() + ": requires parameter"
              );
            }
            pushArgValue(global, config, longArg.name, val);
          } else {
            // Use shortFor because -N is short for --no-buffer
            // and we want to end up with {buffer: false}
            config = setArgValue(
              global,
              config,
              longArg.name,
              toBoolean(shortFor)
            );
          }
          if (supportedOpts && lookup) {
            checkShortOpt(lookup, longArg.name, supportedOpts, global);
          }
        }
      }
    } else {
      if (
        typeof arg !== "string" &&
        arg.tokens.length &&
        typeof arg.tokens[0] !== "string"
      ) {
        const isOrBeginsWith = arg.tokens.length === 1 ? "is" : "begins with";
        warnings.push([
          "ambiguous argument",
          "argument " +
            isOrBeginsWith +
            " a " +
            arg.tokens[0].type +
            ", assuming it's a URL\n" +
            underlineNode(arg.tokens[0].syntaxNode),
        ]);
      }
      pushArgValue(global, config, "url", arg);
    }
  }

  for (const cfg of global.configs) {
    for (const [arg, values] of Object.entries(cfg)) {
      if (Array.isArray(values) && !canBeList.has(arg)) {
        cfg[arg] = values[values.length - 1];
      }
    }
  }
  return global;
};

// Match Python's urllib.parse.quote() behavior
// https://github.com/python/cpython/blob/3.11/Lib/urllib/parse.py#L826
// You're not supposed to percent encode non-ASCII characters, but
// both curl and Python let you do it by encoding each UTF-8 byte.
// TODO: ignore hex case?
const UTF8encoder = new TextEncoder();
export const _percentEncode = (s: string): string => {
  return [...UTF8encoder.encode(s)]
    .map((b) => {
      if (
        // A-Z
        (b >= 0x41 && b <= 0x5a) ||
        // a-z
        (b >= 0x61 && b <= 0x7a) ||
        // 0-9
        (b >= 0x30 && b <= 0x39) ||
        // -._~
        b === 0x2d ||
        b === 0x2e ||
        b === 0x5f ||
        b === 0x7e
      ) {
        return String.fromCharCode(b);
      }
      return "%" + b.toString(16).toUpperCase().padStart(2, "0");
    })
    .join("");
};
export function percentEncode(s: Word): Word {
  const newTokens = [];
  for (const token of s.tokens) {
    newTokens.push(typeof token === "string" ? _percentEncode(token) : token);
  }
  return new Word(newTokens);
}

export function percentEncodePlus(s: Word): Word {
  const newTokens = [];
  for (const token of s.tokens) {
    newTokens.push(
      typeof token === "string"
        ? _percentEncode(token).replace(/%20/g, "+")
        : token
    );
  }
  return new Word(newTokens);
}

// Reimplements decodeURIComponent but ignores variables/commands
export function wordDecodeURIComponent(s: Word): Word {
  const newTokens = [];
  for (const token of s.tokens) {
    newTokens.push(
      typeof token === "string" ? decodeURIComponent(token) : token
    );
  }
  return new Word(newTokens);
}

export function parseQueryString(
  // if url is 'example.com?' => s is ''
  // if url is 'example.com'  => s is null
  s: Word | null
): [QueryList | null, QueryDict | null] {
  if (!s || s.isEmpty()) {
    return [null, null];
  }

  const asList: QueryList = [];
  for (const param of s.split("&")) {
    // Most software libraries don't let you distinguish between a=&b= and a&b,
    // so if we get an `a&b`-type query string, don't bother.
    if (!param.includes("=")) {
      return [null, null];
    }

    const [key, val] = param.split("=", 2);
    let decodedKey;
    let decodedVal;
    try {
      // https://url.spec.whatwg.org/#urlencoded-parsing
      // recommends replacing + with space before decoding.
      decodedKey = wordDecodeURIComponent(key.replace(/\+/g, " "));
      decodedVal = wordDecodeURIComponent(val.replace(/\+/g, " "));
    } catch (e) {
      if (e instanceof URIError) {
        // Query string contains invalid percent encoded characters,
        // we cannot properly convert it.
        return [null, null];
      }
      throw e;
    }
    // If the query string doesn't round-trip, we cannot properly convert it.
    // TODO: this is a bit Python-specific, ideally we would check how each runtime/library
    // percent-encodes query strings. For example, a %27 character in the input query
    // string will be decoded to a ' but won't be re-encoded into a %27 by encodeURIComponent
    const roundTripKey = percentEncode(decodedKey);
    const roundTripVal = percentEncode(decodedVal);
    // If the original data used %20 instead of + (what requests will send), that's close enough
    if (
      (!eq(roundTripKey, key) && !eq(roundTripKey.replace(/%20/g, "+"), key)) ||
      (!eq(roundTripVal, val) && !eq(roundTripVal.replace(/%20/g, "+"), val))
    ) {
      return [null, null];
    }
    asList.push([decodedKey, decodedVal]);
  }

  // Group keys
  const keyWords: { [key: string]: Word } = {};
  const uniqueKeys: { [key: string]: Array<Word> } = {};
  let prevKey = null;
  for (const [key, val] of asList) {
    const keyStr = key.toString(); // TODO: do this better
    if (prevKey === keyStr) {
      uniqueKeys[keyStr].push(val);
    } else if (!Object.prototype.hasOwnProperty.call(uniqueKeys, keyStr)) {
      uniqueKeys[keyStr] = [val];
      keyWords[keyStr] = key;
    } else {
      // If there's a repeated key with a different key between
      // one of its repetitions, there is no way to represent
      // this query string as a dictionary.
      return [asList, null];
    }
    prevKey = keyStr;
  }

  // Convert lists with 1 element to the element
  const asDict: QueryDict = [];
  for (const [keyStr, val] of Object.entries(uniqueKeys)) {
    asDict.push([keyWords[keyStr], val.length === 1 ? val[0] : val]);
  }

  return [asList, asDict];
}

export function parseurl(
  global: GlobalConfig,
  config: OperationConfig,
  url: Word
): Curl_URL {
  // This is curl's parseurl()
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L1144
  // Except we want to accept all URLs.
  // curl further validates URLs in curl_url_get()
  // https://github.com/curl/curl/blob/curl-7_86_0/lib/urlapi.c#L1374
  const u: Curl_URL = {
    scheme: new Word(),
    host: new Word(),
    path: new Word(), // with leading '/'
    query: new Word(), // with leading '?'
    originalQuery: new Word(), // with leading '?'
    fragment: new Word(), // with leading '#'
  };

  // Remove url glob escapes
  // https://github.com/curl/curl/blob/curl-7_87_0/src/tool_urlglob.c#L395-L398
  if (!config.globoff) {
    url = url.replace(/\\([[\]{}])/g, "$1");
  }

  // Prepend "http"/"https" if the scheme is missing.
  // RFC 3986 3.1 says
  //   scheme      = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
  // but curl will accept a digit/plus/minus/dot in the first character
  // curl will also accept a url with one / like http:/localhost
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L960
  let schemeMatch = null;
  if (url.tokens.length && typeof url.tokens[0] === "string") {
    schemeMatch = url.tokens[0].match(/^([a-zA-Z0-9+-.]*):\/\/*/);
  }
  if (schemeMatch) {
    const [schemeAndSlashes, scheme] = schemeMatch;
    u.scheme = new Word(scheme.toLowerCase());
    url = url.slice(schemeAndSlashes.length);
  } else {
    // curl defaults to https://
    // we don't because most libraries won't downgrade to http
    // if you ask for https, unlike curl.
    // TODO: handle file:// scheme
    u.scheme = config["proto-default"] ?? new Word("http");
  }
  if (!eq(u.scheme, "http") && !eq(u.scheme, "https")) {
    warnf(global, ["bad-scheme", `Protocol "${u.scheme}" not supported`]);
  }

  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L992
  const hostMatch = url.indexOfFirstChar("/?#");
  if (hostMatch !== -1) {
    u.host = url.slice(0, hostMatch);
    // TODO: u.path might end up empty if indexOfFirstChar found ?#
    u.path = url.slice(hostMatch); // keep leading '/' in .path
    // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L1024
    const fragmentIndex = u.path.indexOf("#");
    const queryIndex = u.path.indexOf("?");
    if (fragmentIndex !== -1) {
      u.fragment = u.path.slice(fragmentIndex);
      if (queryIndex !== -1 && queryIndex < fragmentIndex) {
        u.query = u.path.slice(queryIndex, fragmentIndex);
        u.path = u.path.slice(0, queryIndex);
      } else {
        u.path = u.path.slice(0, fragmentIndex);
      }
    } else if (queryIndex !== -1) {
      u.query = u.path.slice(queryIndex);
      u.path = u.path.slice(0, queryIndex);
    }
  } else {
    u.host = url;
  }

  // parse username:password@hostname
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L1083
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/urlapi.c#L460
  // https://github.com/curl/curl/blob/curl-7_85_0/lib/url.c#L2827
  const authMatch = u.host.indexOf("@");
  if (authMatch !== -1) {
    const auth = u.host.slice(0, authMatch);
    u.host = u.host.slice(authMatch + 1); // throw away '@'
    // TODO: this makes this command line option sort of supported but not really
    if (!config["disallow-username-in-url"]) {
      // Curl will exit if this is the case, but we just remove it from the URL
      u.auth = auth;
      if (auth.includes(":")) {
        [u.user, u.password] = auth.split(":", 2);
      } else {
        u.user = auth;
        u.password = new Word(); // if there's no ':', curl will append it
      }
    }
  }

  // TODO: need to extract port first
  // hostname_check()
  // https://github.com/curl/curl/blob/curl-7_86_0/lib/urlapi.c#L572
  // if (!u.host) {
  //   warnf(global, [
  //     "no-host",
  //     "Found empty host in URL: " + JSON.stringify(url),
  //   ]);
  // } else if (u.host.startsWith("[")) {
  //   if (!u.host.endsWith("]")) {
  //     warnf(global, [
  //       "bad-host",
  //       "Found invalid IPv6 address in URL: " + JSON.stringify(url),
  //     ]);
  //   } else {
  //     const firstWeirdCharacter = u.host.match(/[^0123456789abcdefABCDEF:.]/);
  //     // %zone_id
  //     if (firstWeirdCharacter && firstWeirdCharacter[0] !== "%") {
  //       warnf(global, [
  //         "bad-host",
  //         "Found invalid IPv6 address in URL: " + JSON.stringify(url),
  //       ]);
  //     }
  //   }
  // } else {
  //   const firstInvalidCharacter = u.host.match(
  //     /[\r\n\t/:#?!@{}[\]\\$'"^`*<>=;,]/
  //   );
  //   if (firstInvalidCharacter) {
  //     warnf(global, [
  //       "bad-host",
  //       "Found invalid character " +
  //         JSON.stringify(firstInvalidCharacter[0]) +
  //         " in URL: " +
  //         JSON.stringify(url),
  //     ]);
  //   }
  // }

  return u;
}

export function buildURL(
  global: GlobalConfig,
  config: OperationConfig,
  url: Word,
  uploadFile?: Word,
  stdin?: Word,
  stdinFile?: Word
): [
  Curl_URL,
  Word,
  string | null,
  Word,
  QueryList | null,
  QueryDict | null,
  Word,
  Word,
  DataParam[] | null,
  DataParam[] | null
] {
  const u = parseurl(global, config, url);

  // https://github.com/curl/curl/blob/curl-7_85_0/src/tool_operate.c#L1124
  // https://github.com/curl/curl/blob/curl-7_85_0/src/tool_operhlp.c#L76
  if (uploadFile) {
    // TODO: it's more complicated
    if (u.path.isEmpty()) {
      u.path = uploadFile.prepend("/");
    } else if (u.path.endsWith("/")) {
      u.path = u.path.add(uploadFile);
    }

    if (config.get) {
      warnf(global, [
        "data-ignored",
        "curl doesn't let you pass --get and --upload-file together",
      ]);
    }
  }

  // TODO: remove .originalQuery
  const urlWithOriginalQuery = mergeWords([
    u.scheme,
    "://",
    u.host,
    u.path,
    u.query,
    u.fragment,
  ]);

  // curl example.com example.com?foo=bar --url-query isshared=t
  // will make requests for
  // example.com/?isshared=t
  // example.com/?foo=bar&isshared=t
  //
  // so the query could come from
  //   1. `--url` (i.e. the requested URL)
  //   2. `--url-query` or `--get --data` (the latter takes precedence)
  //
  // If it comes from the latter, we might need to generate code to read
  // from one or more files.
  // When there's multiple urls, the latter applies to all of them
  // but the query from --url only applies to that URL.
  //
  // There's 3 cases for the query:
  // 1. it's well-formed and can be expressed as a list of tuples (or a dict)
  //   `?one=1&one=1&two=2`
  // 2. it can't, for example because one of the pieces doesn't have a '='
  //   `?one`
  // 3. we need to generate code that reads from a file
  //
  // If there's only one URL we merge the query from the URL with the shared part.
  //
  // If there's multiple URLs and a shared part that reads from a file (case 3),
  // we only write the file reading code once, pass it as the params= argument
  // and the part from the URL has to be passed as a string in the URL
  // and requests will combine the query in the URL with the query in params=.
  //
  // Otherwise, we print each query for each URL individually, either as a
  // list of tuples if we can or in the URL if we can't.
  //
  // When files are passed in through --data-urlencode or --url-query
  // we can usually treat them as case 1 as well (in Python), but that would
  // generate code slightly different from curl because curl reads the file once
  // upfront, whereas we would read the file multiple times and it might contain
  // different data each time (for example if it's /dev/urandom).
  let urlQueryArray: DataParam[] | null = null;
  let queryArray: DataParam[] | null = null;
  let queryStrReadsFile: string | null = null;
  if (u.query.toBool() || (config["url-query"] && config["url-query"].length)) {
    let queryStr: Word | null = null;

    let queryParts: SrcDataParam[] = [];
    if (u.query.toBool()) {
      // remove the leading '?'
      queryParts.push(["raw", u.query.slice(1)]);
      [queryArray, queryStr, queryStrReadsFile] = buildData(
        queryParts,
        stdin,
        stdinFile
      );
      urlQueryArray = queryArray;
    }
    if (config["url-query"]) {
      queryParts = queryParts.concat(config["url-query"]);
      [queryArray, queryStr, queryStrReadsFile] = buildData(
        queryParts,
        stdin,
        stdinFile
      );
    }

    // TODO: check the curl source code
    // TODO: curl localhost:8888/?
    // will request /?
    // but
    // curl localhost:8888/? --url-query ''
    // (or --get --data '') will request /
    u.query = new Word();
    if (queryStr && queryStr.toBool()) {
      u.query = queryStr.prepend("?");
    }
  }
  const urlWithoutQueryArray = mergeWords([
    u.scheme,
    "://",
    u.host,
    u.path,
    u.fragment,
  ]);
  url = mergeWords([u.scheme, "://", u.host, u.path, u.query, u.fragment]);
  let urlWithoutQueryList = url;
  // TODO: parseQueryString() doesn't accept leading '?'
  let [queryList, queryDict] = parseQueryString(
    u.query.toBool() ? u.query.slice(1) : new Word()
  );
  if (queryList && queryList.length) {
    // TODO: remove the fragment too?
    urlWithoutQueryList = mergeWords([
      u.scheme,
      "://",
      u.host,
      u.path,
      u.fragment,
    ]);
  } else {
    queryList = null;
    queryDict = null;
  }

  // TODO: --path-as-is
  // TODO: --request-target
  return [
    u,
    url,
    queryStrReadsFile,

    urlWithoutQueryList,
    queryList,
    queryDict,

    urlWithoutQueryArray,
    urlWithOriginalQuery,
    queryArray,
    urlQueryArray,
  ];
}

function buildData(
  configData: SrcDataParam[],
  stdin?: Word,
  stdinFile?: Word
): [DataParam[], Word, string | null] {
  const data: DataParam[] = [];
  let dataStrState = new Word();
  for (const [i, x] of configData.entries()) {
    const type = x[0];
    let value = x[1];
    let name: Word | null = null;

    if (i > 0 && type !== "json") {
      dataStrState = dataStrState.append("&");
    }

    if (type === "urlencode") {
      // curl checks for = before @
      const splitOn = value.includes("=") || !value.includes("@") ? "=" : "@";
      // If there's no = or @ then the entire content is treated as a value and encoded
      if (value.includes("@") || value.includes("=")) {
        [name, value] = value.split(splitOn, 2);
      }

      if (splitOn === "=") {
        if (name && name.toBool()) {
          dataStrState = dataStrState.add(name).append("=");
        }
        // curl's --data-urlencode percent-encodes spaces as "+"
        // https://github.com/curl/curl/blob/curl-7_86_0/src/tool_getparam.c#L630
        dataStrState = dataStrState.add(percentEncodePlus(value));
        continue;
      }

      name = name && name.toBool() ? name : null;
      value = value.prepend("@");
    }

    let filename: Word | null = null;

    if (type !== "raw" && value.startsWith("@")) {
      filename = value.slice(1);
      if (eq(filename, "-")) {
        if (stdin !== undefined) {
          switch (type) {
            case "binary":
            case "json":
              value = stdin;
              break;
            case "urlencode":
              value = mergeWords([
                name && name.length ? name.append("=") : new Word(),
                percentEncodePlus(stdin),
              ]);
              break;
            default:
              value = stdin.replace(/[\n\r]/g, "");
          }
          filename = null;
        } else if (stdinFile !== undefined) {
          filename = stdinFile;
        } else {
          // TODO: if stdin is read twice, it will be empty the second time
          // TODO: `STDIN_SENTINEL` so that we can tell the difference between
          // a stdinFile called "-" and stdin for the error message
        }
      }
    }

    if (filename !== null) {
      if (dataStrState.toBool()) {
        data.push(dataStrState);
        dataStrState = new Word();
      }
      // If `filename` isn't null, then `type` can't be "raw"
      data.push([type as FileParamType, name, filename]);
    } else {
      dataStrState = dataStrState.add(value);
    }
  }
  if (dataStrState.toBool()) {
    data.push(dataStrState);
  }

  let dataStrReadsFile: string | null = null;
  const dataStr = mergeWords(
    data.map((d) => {
      if (Array.isArray(d)) {
        const name = d[1];
        const filename = d[2];
        dataStrReadsFile ||= filename.toString(); // report first file
        if (name) {
          return mergeWords([name, "=@", filename]);
        }
        return filename.prepend("@");
      }
      return d;
    })
  );

  return [data, dataStr, dataStrReadsFile];
}

function buildRequest(
  global: GlobalConfig,
  config: OperationConfig,
  stdin?: Word,
  stdinFile?: Word
): Request {
  if (!config.url || !config.url.length) {
    // TODO: better error message (could be parsing fail)
    throw new CCError("no URL specified!");
  }

  let headers: Headers = [];
  if (config.header) {
    for (const header of config.header) {
      if (header.startsWith("@")) {
        warnf(global, [
          "header-file",
          "passing a file for --header/-H is not supported: " +
            JSON.stringify(header.toString()),
        ]);
        continue;
      }

      if (header.includes(":")) {
        const [name, value] = header.split(":", 2);
        const nameToken = firstShellToken(name);
        if (nameToken) {
          warnf(global, [
            "header-expression",
            "ignoring " +
              nameToken.type +
              " in header name\n" +
              underlineNode(nameToken.syntaxNode),
          ]);
        }
        const hasValue = value && value.trim().toBool();
        const headerValue = hasValue ? value.removeFirstChar(" ") : null;
        headers.push([name, headerValue]);
      } else if (header.includes(";")) {
        const [name] = header.split(";", 2);
        headers.push([name, new Word()]);
      } else {
        // TODO: warn that this header arg is ignored
      }
    }
  }
  const lowercase =
    headers.length > 0 && headers.every((h) => eq(h[0], h[0].toLowerCase()));

  // Handle repeated headers
  // For Cookie and Accept, merge the values using ';' and ',' respectively
  // For other headers, warn about the repeated header
  const uniqueHeaders: { [key: string]: [Word, Word | null][] } = {};
  for (const [name, value] of headers) {
    // TODO: something better, at least warn that variable is ignored
    const lowerName = name.toLowerCase().toString();
    if (!uniqueHeaders[lowerName]) {
      uniqueHeaders[lowerName] = [];
    }
    uniqueHeaders[lowerName].push([name, value]);
  }
  headers = [];
  for (const [lowerName, repeatedHeaders] of Object.entries(uniqueHeaders)) {
    if (repeatedHeaders.length === 1) {
      headers.push(repeatedHeaders[0]);
      continue;
    }
    // If they're all null, just use the first one
    if (repeatedHeaders.every((h) => h[1] === null)) {
      const lastRepeat = repeatedHeaders[repeatedHeaders.length - 1];
      // Warn users if some are capitalized differently
      if (new Set(repeatedHeaders.map((h) => h[0])).size > 1) {
        warnf(global, [
          "repeated-header",
          `"${lastRepeat[0]}" header unset ${repeatedHeaders.length} times`,
        ]);
      }
      headers.push(lastRepeat);
      continue;
    }
    // Otherwise there's at least one non-null value, so we can ignore the nulls
    // TODO: if the values of the repeated headers are the same, just use the first one
    //     'content-type': 'application/json; application/json',
    // doesn't really make sense
    const nonEmptyHeaders = repeatedHeaders.filter((h) => h[1] !== null);
    if (nonEmptyHeaders.length === 1) {
      headers.push(nonEmptyHeaders[0]);
      continue;
    }
    // https://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Standard_request_fields
    // and then searched for "#" in the RFCs that define each header
    const commaSeparatedHeaders = new Set(
      [
        "A-IM",
        "Accept",
        "Accept-Charset",
        // "Accept-Datetime",
        "Accept-Encoding",
        "Accept-Language",
        // "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        // TODO: auth-scheme [ 1*SP ( token68 / #auth-param ) ]
        // "Authorization",
        "Cache-Control",
        "Connection",
        "Content-Encoding",
        // "Content-Length",
        // "Content-MD5",
        // "Content-Type", // semicolon
        // "Cookie", // semicolon
        // "Date",
        "Expect",
        "Forwarded",
        // "From",
        // "Host",
        // "HTTP2-Settings",
        "If-Match",
        // "If-Modified-Since",
        "If-None-Match",
        // "If-Range",
        // "If-Unmodified-Since",
        // "Max-Forwards",
        // "Origin",
        // "Pragma",
        // "Prefer", // semicolon
        // "Proxy-Authorization",
        "Range",
        // "Referer",
        "TE",
        "Trailer",
        "Transfer-Encoding",
        // "User-Agent",
        "Upgrade",
        "Via",
        "Warning",
      ].map((h) => h.toLowerCase())
    );
    const semicolonSeparatedHeaders = new Set(
      ["Content-Type", "Cookie", "Prefer"].map((h) => h.toLowerCase())
    );
    let mergeChar = "";
    if (commaSeparatedHeaders.has(lowerName)) {
      mergeChar = ", ";
    } else if (semicolonSeparatedHeaders.has(lowerName)) {
      mergeChar = "; ";
    }
    if (mergeChar) {
      const merged = joinWords(
        nonEmptyHeaders.map((h) => h[1]) as Word[],
        mergeChar
      );
      warnf(global, [
        "repeated-header",
        `merged ${nonEmptyHeaders.length} "${
          nonEmptyHeaders[nonEmptyHeaders.length - 1][0]
        }" headers together with "${mergeChar.trim()}"`,
      ]);
      headers.push([nonEmptyHeaders[0][0], merged]);
      continue;
    }

    warnf(global, [
      "repeated-header",
      `found ${nonEmptyHeaders.length} "${
        nonEmptyHeaders[nonEmptyHeaders.length - 1][0]
      }" headers, only the last one will be sent`,
    ]);
    headers = headers.concat(nonEmptyHeaders);
  }

  let cookies;
  const cookieFiles: Word[] = [];
  const cookieHeaders = headers.filter(
    (h) => h[0].toLowerCase().toString() === "cookie"
  );
  if (cookieHeaders.length === 1 && cookieHeaders[0][1] !== null) {
    const parsedCookies = parseCookiesStrict(cookieHeaders[0][1]);
    if (parsedCookies) {
      cookies = parsedCookies;
    }
  } else if (cookieHeaders.length === 0 && config.cookie) {
    // If there is a Cookie header, --cookies is ignored
    const cookieStrings: Word[] = [];
    for (const c of config.cookie) {
      // a --cookie without a = character reads from it as a filename
      if (c.includes("=")) {
        cookieStrings.push(c);
      } else {
        cookieFiles.push(c);
      }
    }
    if (cookieStrings.length) {
      const cookieString = joinWords(config.cookie, "; ");
      _setHeaderIfMissing(headers, "Cookie", cookieString, lowercase);
      const parsedCookies = parseCookies(cookieString);
      if (parsedCookies) {
        cookies = parsedCookies;
      }
    }
  }

  if (config["user-agent"]) {
    _setHeaderIfMissing(headers, "User-Agent", config["user-agent"], lowercase);
  }
  if (config.referer) {
    // referer can be ";auto" or followed by ";auto", we ignore that.
    const referer = config.referer.replace(/;auto$/, "");
    if (referer.length) {
      _setHeaderIfMissing(headers, "Referer", referer, lowercase);
    }
  }
  if (config.range) {
    let range = config.range.prepend("bytes=");
    if (!range.includes("-")) {
      range = range.append("-");
    }
    _setHeaderIfMissing(headers, "Range", range, lowercase);
  }
  if (config["time-cond"]) {
    let timecond = config["time-cond"];
    let header = "If-Modified-Since";
    switch (timecond.charAt(0)) {
      case "+":
        timecond = timecond.slice(1);
        break;
      case "-":
        timecond = timecond.slice(1);
        header = "If-Unmodified-Since";
        break;
      case "=":
        timecond = timecond.slice(1);
        header = "Last-Modified";
        break;
    }
    // TODO: parse date
    _setHeaderIfMissing(headers, header, timecond, lowercase);
  }

  let data;
  let dataStr;
  let dataStrReadsFile;
  let queryArray;
  if (config.data && config.data.length) {
    if (config.get) {
      // https://github.com/curl/curl/blob/curl-7_85_0/src/tool_operate.c#L721
      // --get --data will overwrite --url-query, but if there's no --data, for example,
      // curl --url-query bar --get example.com
      // it won't
      // https://daniel.haxx.se/blog/2022/11/10/append-data-to-the-url-query/
      config["url-query"] = config.data;
      delete config.data;
    } else {
      [data, dataStr, dataStrReadsFile] = buildData(
        config.data,
        stdin,
        stdinFile
      );
    }
  }
  if (config["url-query"]) {
    [queryArray] = buildData(config["url-query"], stdin, stdinFile);
  }

  const urls: RequestUrl[] = [];
  const uploadFiles = config["upload-file"] || [];
  const outputFiles = config.output || [];
  // eslint-disable-next-line prefer-const
  for (let [i, originalUrl] of config.url.entries()) {
    const uploadFile: Word | undefined = uploadFiles[i];
    const output: Word | undefined = outputFiles[i];

    const [
      urlObj,
      url,
      queryReadsFile,

      urlWithoutQueryList,
      queryList,
      queryDict,

      urlWithoutQueryArray,
      urlWithOriginalQuery,
      queryArray,
      urlQueryArray,
    ] = buildURL(
      global,
      config,
      originalUrl, // TODO: support tokens in url
      uploadFile,
      stdin,
      stdinFile
    );

    // curl expects you to uppercase methods always. If you do -X PoSt, that's what it
    // will send, but most APIs will helpfully uppercase what you pass in as the method.
    //
    // There are many places where curl determines the method, this is the last one:
    // https://github.com/curl/curl/blob/curl-7_85_0/lib/http.c#L2032
    let method = new Word("GET");
    if (
      config.request &&
      // Safari adds `-X null` if it can't determine the request type
      // https://github.com/WebKit/WebKit/blob/f58ef38d48f42f5d7723691cb090823908ff5f9f/Source/WebInspectorUI/UserInterface/Models/Resource.js#L1250
      !eq(config.request, "null")
    ) {
      method = config.request;
    } else if (config.head) {
      method = new Word("HEAD");
    } else if (uploadFile) {
      // --upload-file '' doesn't do anything.
      method = new Word("PUT");
    } else if (!config.get && (has(config, "data") || has(config, "form"))) {
      method = new Word("POST");
    }

    const requestUrl: RequestUrl = {
      originalUrl: originalUrl,
      urlWithoutQueryList,
      url,
      urlObj,
      urlWithOriginalQuery,
      urlWithoutQueryArray,
      method,
    };
    if (queryReadsFile) {
      requestUrl.queryReadsFile = queryReadsFile;
    }
    if (queryList) {
      requestUrl.queryList = queryList;
      if (queryDict) {
        requestUrl.queryDict = queryDict;
      }
    }
    if (queryArray) {
      requestUrl.queryArray = queryArray;
    }
    if (urlQueryArray) {
      requestUrl.urlQueryArray = urlQueryArray;
    }
    if (uploadFile) {
      requestUrl.uploadFile = uploadFile;
    }
    if (output) {
      requestUrl.output = output;
    }

    // --user takes precedence over the URL
    const auth = config.user || urlObj.auth;
    if (auth) {
      const [user, pass] = auth.split(":", 2);
      requestUrl.auth = [user, pass ? pass : new Word()];
    }

    urls.push(requestUrl);
  }
  // --get moves --data into the URL's query string
  if (config.get && config.data) {
    delete config.data;
  }

  if ((config["upload-file"] || []).length > config.url.length) {
    warnf(global, [
      "too-many-upload-files",
      "Got more --upload-file/-T options than URLs: " +
        config["upload-file"]?.map((f) => JSON.stringify(f)).join(", "),
    ]);
  }
  if ((config.output || []).length > config.url.length) {
    warnf(global, [
      "too-many-ouptut-files",
      "Got more --output/-o options than URLs: " +
        config.output?.map((f) => JSON.stringify(f)).join(", "),
    ]);
  }

  const request: Request = {
    urls,
    authType: pickAuth(config.authtype),
    lowercaseHeaders: lowercase,
  };
  // TODO: warn about unused stdin?
  if (stdin) {
    request.stdin = stdin;
  }
  if (stdinFile) {
    request.stdinFile = stdinFile;
  }

  if (cookies) {
    // generators that use .cookies need to do
    // deleteHeader(request, 'cookie')
    request.cookies = cookies;
  }
  if (cookieFiles.length) {
    request.cookieFiles = cookieFiles;
  }
  if (config["cookie-jar"]) {
    request.cookieJar = config["cookie-jar"];
  }

  if (config.compressed !== undefined) {
    request.compressed = config.compressed;
  }

  if (config.json) {
    _setHeaderIfMissing(headers, "Content-Type", "application/json", lowercase);
    _setHeaderIfMissing(
      headers,
      "Accept",
      new Word(["application/json"]),
      lowercase
    );
  } else if (config.data) {
    _setHeaderIfMissing(
      headers,
      "Content-Type",
      "application/x-www-form-urlencoded",
      lowercase
    );
  } else if (config.form) {
    // TODO: set content-type?
    request.multipartUploads = [];
    for (const multipartArgument of config.form) {
      // TODO: https://curl.se/docs/manpage.html#-F
      // -F is the most complicated option, we only handle
      // name=value and name=@file and name=<file
      if (!multipartArgument.value.includes("=")) {
        throw new CCError(
          "invalid value for --form/-F: " +
            JSON.stringify(multipartArgument.value)
        );
      }
      const [name, value] = multipartArgument.value.split("=", 2);

      const isString = multipartArgument.type === "string";

      if (!isString && value.charAt(0) === "@") {
        const contentFile = value.slice(1);
        const filename = contentFile;
        request.multipartUploads.push({ name, contentFile, filename });
      } else if (!isString && value.charAt(0) === "<") {
        const contentFile = value.slice(1);
        request.multipartUploads.push({ name, contentFile });
      } else {
        const content = value;
        request.multipartUploads.push({ name, content });
      }
    }
  }

  if (config["aws-sigv4"]) {
    // https://github.com/curl/curl/blob/curl-7_86_0/lib/setopt.c#L678-L679
    request.authType = "aws-sigv4";
    request.awsSigV4 = config["aws-sigv4"];
  }
  if (request.authType === "bearer" && config["oauth2-bearer"]) {
    _setHeaderIfMissing(
      headers,
      "Authorization",
      config["oauth2-bearer"].prepend("Bearer "),
      lowercase
    );
  }
  if (config.delegation) {
    request.delegation = config.delegation;
  }

  if (headers.length > 0) {
    for (let i = headers.length - 1; i >= 0; i--) {
      if (headers[i][1] === null) {
        // TODO: ideally we should generate code that explicitly unsets the header too
        headers.splice(i, 1);
      }
    }
    request.headers = headers;
  }

  if (config.data && config.data.length) {
    request.data = dataStr;
    if (dataStrReadsFile) {
      request.dataReadsFile = dataStrReadsFile;
    }
    request.dataArray = data;
    // TODO: remove these
    request.isDataRaw = false;
    request.isDataBinary = (data || []).some(
      (d) => Array.isArray(d) && d[0] === "binary"
    );
  }
  if (queryArray) {
    // If we have to generate code that reads from a file, we
    // need to do it once for all URLs.
    request.queryArray = queryArray;
  }

  if (config.insecure) {
    request.insecure = true;
  }
  // TODO: if the URL doesn't start with https://, curl doesn't verify
  // certificates, etc.
  if (config.cert) {
    // --key has no effect if --cert isn't passed
    request.cert = config.key ? [config.cert, config.key] : config.cert;
  }
  if (config.cacert) {
    request.cacert = config.cacert;
  }
  if (config.capath) {
    request.capath = config.capath;
  }
  if (config.proxy) {
    // https://github.com/curl/curl/blob/e498a9b1fe5964a18eb2a3a99dc52160d2768261/lib/url.c#L2388-L2390
    request.proxy = config.proxy;
    if (config["proxy-user"]) {
      request.proxyAuth = config["proxy-user"];
    }
  }
  if (config["max-time"]) {
    request.timeout = config["max-time"];
    if (
      config["max-time"].isString() &&
      // TODO: parseFloat() like curl
      isNaN(parseFloat(config["max-time"].toString()))
    ) {
      warnf(global, [
        "max-time-not-number",
        "option --max-time: expected a proper numerical parameter: " +
          JSON.stringify(config["max-time"]),
      ]);
    }
  }
  if (config["connect-timeout"]) {
    request.connectTimeout = config["connect-timeout"];
    if (
      config["connect-timeout"].isString() &&
      isNaN(parseFloat(config["connect-timeout"].toString()))
    ) {
      warnf(global, [
        "connect-timeout-not-number",
        "option --connect-timeout: expected a proper numerical parameter: " +
          JSON.stringify(config["connect-timeout"]),
      ]);
    }
  }
  if (Object.prototype.hasOwnProperty.call(config, "location")) {
    request.followRedirects = config.location;
  }
  if (config["location-trusted"]) {
    request.followRedirectsTrusted = config["location-trusted"];
  }
  if (config["max-redirs"]) {
    request.maxRedirects = config["max-redirs"].trim();
    if (
      config["max-redirs"].isString() &&
      !isInt(config["max-redirs"].toString())
    ) {
      warnf(global, [
        "max-redirs-not-int",
        "option --max-redirs: expected a proper numerical parameter: " +
          JSON.stringify(config["max-redirs"]),
      ]);
    }
  }

  const http2 = config.http2 || config["http2-prior-knowledge"];
  if (http2) {
    request.http2 = http2;
  }
  if (config.http3) {
    request.http3 = config.http3;
  }

  return request;
}

function buildRequests(
  global: GlobalConfig,
  stdin?: Word,
  stdinFile?: Word
): Request[] {
  if (!global.configs.length) {
    // shouldn't happen
    warnf(global, ["no-configs", "got empty config object"]);
  }
  return global.configs.map((config) =>
    buildRequest(global, config, stdin, stdinFile)
  );
}

function parseCurlCommand(
  curlCommand: string | string[],
  supportedArgs?: Set<string>,
  warnings: Warnings = []
): Request[] {
  let cmdName: string,
    args: Word[],
    stdin: undefined | Word,
    stdinFile: undefined | Word;
  if (Array.isArray(curlCommand)) {
    let rest;
    [cmdName, ...rest] = curlCommand;
    if (typeof cmdName === "undefined") {
      throw new CCError("no arguments provided");
    }
    args = rest.map((arg) => new Word([arg]));
  } else {
    ({ cmdName, args, stdin, stdinFile } = tokenize(curlCommand, warnings));
  }

  if (cmdName.trim() !== "curl") {
    const shortenedCmdName =
      cmdName.length > 30 ? cmdName.slice(0, 27) + "..." : cmdName;
    if (cmdName.startsWith("curl ")) {
      throw new CCError(
        'command should begin with a single token "curl" but instead begins with ' +
          JSON.stringify(shortenedCmdName)
      );
    } else {
      throw new CCError(
        'command should begin with "curl" but instead begins with ' +
          JSON.stringify(shortenedCmdName)
      );
    }
  }

  const global = parseArgs(
    args,
    curlLongOpts,
    curlShortOpts,
    supportedArgs,
    warnings
  );

  return buildRequests(global, stdin, stdinFile);
}

// Gets the first header, matching case-insensitively
const getHeader = (
  request: Request,
  header: string
): Word | null | undefined => {
  if (!request.headers) {
    return undefined;
  }
  const lookup = header.toLowerCase();
  for (const [h, v] of request.headers) {
    if (h.toLowerCase().toString() === lookup) {
      return v;
    }
  }
  return undefined;
};

const getContentType = (request: Request): string | null | undefined => {
  if (!request.headers) {
    return undefined;
  }
  const contentTypeHeader = getHeader(request, "content-type");
  if (!contentTypeHeader) {
    return contentTypeHeader;
  }
  return contentTypeHeader.split(";")[0].trim().toString();
};

const _hasHeader = (headers: Headers, header: Word | string): boolean => {
  const lookup = header.toLowerCase();
  for (const h of headers) {
    if (eq(h[0].toLowerCase(), lookup)) {
      return true;
    }
  }
  return false;
};

const hasHeader = (request: Request, header: Word | string): boolean => {
  if (!request.headers) {
    return false;
  }
  return _hasHeader(request.headers, header);
};

const _setHeaderIfMissing = (
  headers: Headers,
  header: Word | string,
  value: Word | string,
  lowercase: boolean | number = false
): boolean => {
  if (_hasHeader(headers, header)) {
    return false;
  }

  if (lowercase) {
    header = header.toLowerCase();
  }
  if (typeof header === "string") {
    header = new Word(header);
  }
  if (typeof value === "string") {
    value = new Word(value);
  }
  headers.push([header, value]);
  return true;
};
const setHeaderIfMissing = (request: Request, header: string, value: Word) => {
  if (!request.headers) {
    return;
  }
  return _setHeaderIfMissing(
    request.headers,
    header,
    value,
    request.lowercaseHeaders
  );
};

const _deleteHeader = (headers: Headers, header: string) => {
  const lookup = header.toLowerCase();
  for (let i = headers.length - 1; i >= 0; i--) {
    if (headers[i][0].toLowerCase().toString() === lookup) {
      headers.splice(i, 1);
    }
  }
};

const deleteHeader = (request: Request, header: string) => {
  if (!request.headers) {
    return;
  }
  return _deleteHeader(request.headers, header);
};

const countHeader = (request: Request, header: string) => {
  let count = 0;
  const lookup = header.toLowerCase();
  for (const h of request.headers || []) {
    if (h[0].toLowerCase().toString() === lookup) {
      count += 1;
    }
  }
  return count;
};

const parseCookiesStrict = (cookieString: Word): Cookies | null => {
  const cookies: Cookies = [];
  for (let cookie of cookieString.split(";")) {
    cookie = cookie.replace(/^ /, "");
    const [name, value] = cookie.split("=", 2);
    if (value === undefined) {
      return null;
    }
    cookies.push([name, value]);
  }
  if (new Set(cookies.map((c) => c[0])).size !== cookies.length) {
    return null;
  }
  return cookies;
};

const parseCookies = (cookieString: Word): Cookies | null => {
  const cookies: Cookies = [];
  for (let cookie of cookieString.split(";")) {
    cookie = cookie.trim();
    if (!cookie) {
      continue;
    }
    const [name, value] = cookie.split("=", 2);
    cookies.push([name.trim(), (value || "").trim()]);
  }
  if (new Set(cookies.map((c) => c[0])).size !== cookies.length) {
    return null;
  }
  return cookies;
};

export {
  Word,
  mergeWords,
  joinWords,
  curlLongOpts,
  curlShortOpts,
  COMMON_SUPPORTED_ARGS,
  parseCurlCommand,
  parseArgs,
  buildRequests,
  getHeader,
  getContentType,
  hasHeader,
  countHeader,
  _setHeaderIfMissing,
  setHeaderIfMissing,
  deleteHeader,
  has,
  isInt,
  UTF8encoder,
  eq,
};

export type {
  ShellToken,
  Token,
  Request,
  Cookie,
  Cookies,
  QueryList,
  QueryDict,
  DataParam,
  AuthType,
  Warnings,
};
