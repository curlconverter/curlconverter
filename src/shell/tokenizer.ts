import { Word, Token, firstShellToken } from "./Word.js";

import { CCError } from "../utils.js";
import { clip } from "../parse.js";

import parser from "./Parser.js";
import type { Parser } from "./Parser.js";

import { underlineNode, type Warnings } from "../Warnings.js";

const BACKSLASHES = /\\./gs;
function removeBackslash(m: string) {
  return m.charAt(1) === "\n" ? "" : m.charAt(1);
}
function removeBackslashes(str: string): string {
  return str.replace(BACKSLASHES, removeBackslash);
}
// https://www.gnu.org/software/bash/manual/bash.html#Double-Quotes
const DOUBLE_QUOTE_BACKSLASHES = /\\[\\$`"\n]/gs;
function removeDoubleQuoteBackslashes(str: string): string {
  return str.replace(DOUBLE_QUOTE_BACKSLASHES, removeBackslash);
}
// ANSI-C quoted strings look $'like this'.
// Not all shells have them but Bash does
// https://www.gnu.org/software/bash/manual/html_node/ANSI_002dC-Quoting.html
//
// https://git.savannah.gnu.org/cgit/bash.git/tree/lib/sh/strtrans.c
const ANSI_BACKSLASHES =
  /\\(\\|a|b|e|E|f|n|r|t|v|'|"|\?|[0-7]{1,3}|x[0-9A-Fa-f]{1,2}|u[0-9A-Fa-f]{1,4}|U[0-9A-Fa-f]{1,8}|c.)/gs;
function removeAnsiCBackslashes(str: string): string {
  function unescapeChar(m: string) {
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
  }

  return str.replace(ANSI_BACKSLASHES, unescapeChar);
}

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
    case "ansi_c_string":
      return [removeAnsiCBackslashes(node.text.slice(2, -1))];
    case "string":
    case "translated_string": {
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
          '. Must be one of "word", "string", "raw_string", "ansi_c_string", "expansion", "simple_expansion", "translated_string" or "concatenation"\n' +
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

function warnAboutErrorNodes(
  ast: Parser.Tree,
  curlCommand: string,
  warnings: Warnings
) {
  // TODO: get only named children?
  const cursor = ast.walk();
  cursor.gotoFirstChild();
  while (cursor.gotoNextSibling()) {
    if (cursor.nodeType === "ERROR") {
      let currentNode = cursor.currentNode;
      try {
        // TreeCursor.currentNode is a property in Node but a function in the browser
        // https://github.com/tree-sitter/tree-sitter/issues/2195
        currentNode = (
          cursor.currentNode as unknown as () => Parser.SyntaxNode
        )();
      } catch {}
      warnings.push([
        "bash",
        `Bash parsing error on line ${cursor.startPosition.row + 1}:\n` +
          underlineNode(currentNode, curlCommand),
      ]);
      break;
    }
  }
}

function warnAboutUselessBackslash(
  n: Parser.SyntaxNode,
  curlCommandLines: string[],
  warnings: Warnings
) {
  const lastCommandLine = curlCommandLines[n.endPosition.row];
  const impromperBackslash = lastCommandLine.match(/\\\s+$/);
  if (
    impromperBackslash &&
    curlCommandLines.length > n.endPosition.row + 1 &&
    impromperBackslash.index !== undefined
  ) {
    warnings.push([
      "unescaped-newline",
      "The trailling '\\' on line " +
        (n.endPosition.row + 1) +
        " is followed by whitespace, so it won't escape the newline after it:\n" +
        // TODO: cut off line if it's very long?
        lastCommandLine +
        "\n" +
        " ".repeat(impromperBackslash.index) +
        "^".repeat(impromperBackslash[0].length),
    ]);
  }
}

function extractRedirect(
  node: Parser.SyntaxNode,
  curlCommand: string,
  warnings: Warnings
): [Parser.SyntaxNode, Word?, Word?] {
  if (!node.childCount) {
    throw new CCError('got empty "redirected_statement" AST node');
  }

  let stdin, stdinFile;
  const [command, ...redirects] = node.namedChildren;
  if (command.type !== "command") {
    throw new CCError(
      'got "redirected_statement" AST node whose first child is not a "command", got ' +
        command.type +
        " instead\n" +
        underlineNode(command, curlCommand)
    );
  }
  if (node.childCount < 2) {
    throw new CCError(
      'got "redirected_statement" AST node with only one child - no redirect'
    );
  }
  if (redirects.length > 1) {
    warnings.push([
      "multiple-redirects",
      // TODO: this is misleading because not all generators use the redirect
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
    const heredocBody = node.nextNamedSibling;
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
    // TODO: heredocs can do variable expansion and stuff
    if (heredocStart.length) {
      stdin = new Word(heredocBody.text.slice(0, -heredocStart.length));
    } else {
      // this shouldn't happen
      stdin = new Word(heredocBody.text);
    }
  } else if (redirect.type === "herestring_redirect") {
    if (redirect.namedChildCount < 1 || !redirect.firstNamedChild) {
      throw new CCError(
        'got "redirected_statement" AST node with empty herestring'
      );
    }
    // TODO: this just converts bash code to text
    stdin = new Word(redirect.firstNamedChild.text);
  } else {
    throw new CCError(
      'got "redirected_statement" AST node whose second child is not one of "file_redirect", "heredoc_redirect" or "herestring_redirect", got ' +
        command.type +
        " instead"
    );
  }
  return [command, stdin, stdinFile];
}

function _findCurlInPipeline(
  node: Parser.SyntaxNode,
  curlCommand: string,
  warnings: Warnings
): [Parser.SyntaxNode?, Word?, Word?] {
  let command, stdin, stdinFile;
  for (const child of node.namedChildren) {
    if (child.type === "command") {
      const commandName = child.namedChildren[0];
      if (commandName.type !== "command_name") {
        throw new CCError(
          'got "command" AST node whose first child is not a "command_name", got ' +
            commandName.type +
            " instead\n" +
            underlineNode(commandName, curlCommand)
        );
      }
      const commandNameWord = commandName.namedChildren[0];
      if (commandNameWord.type !== "word") {
        throw new CCError(
          'got "command_name" AST node whose first child is not a "word", got ' +
            commandNameWord.type +
            " instead\n" +
            underlineNode(commandNameWord, curlCommand)
        );
      }
      if (commandNameWord.text === "curl") {
        if (!command) {
          command = child;
        } else {
          warnings.push([
            "multiple-curl-in-pipeline",
            "found multiple curl commands in pipeline:\n" +
              underlineNode(child, curlCommand),
          ]);
        }
      }
    } else if (child.type === "redirected_statement") {
      const [redirCommand, redirStdin, redirStdinFile] = extractRedirect(
        child,
        curlCommand,
        warnings
      );
      if (redirCommand.namedChildren[0].text === "curl") {
        if (!command) {
          [command, stdin, stdinFile] = [
            redirCommand,
            redirStdin,
            redirStdinFile,
          ];
        } else {
          warnings.push([
            "multiple-curl-in-pipeline",
            "found multiple curl commands in pipeline:\n" +
              underlineNode(redirCommand, curlCommand),
          ]);
        }
      }
    } else if (child.type === "pipeline") {
      // pipelines can be nested
      // https://github.com/tree-sitter/tree-sitter-bash/issues/167
      const [nestedCommand, nestedStdin, nestedStdinFile] = _findCurlInPipeline(
        child,
        curlCommand,
        warnings
      );
      if (!nestedCommand) {
        continue;
      }
      if (nestedCommand.namedChildren[0].text === "curl") {
        if (!command) {
          [command, stdin, stdinFile] = [
            nestedCommand,
            nestedStdin,
            nestedStdinFile,
          ];
        } else {
          warnings.push([
            "multiple-curl-in-pipeline",
            "found multiple curl commands in pipeline:\n" +
              underlineNode(nestedCommand, curlCommand),
          ]);
        }
      }
    }
  }
  return [command, stdin, stdinFile];
}

// TODO: use pipeline input/output redirects,
// i.e. add stdinCommand and stdout/stdoutFile/stdoutCommand
function findCurlInPipeline(
  node: Parser.SyntaxNode,
  curlCommand: string,
  warnings: Warnings
): [Parser.SyntaxNode, Word?, Word?] {
  const [command, stdin, stdinFile] = _findCurlInPipeline(
    node,
    curlCommand,
    warnings
  );
  if (!command) {
    throw new CCError(
      "could not find curl command in pipeline\n" +
        underlineNode(node, curlCommand)
    );
  }
  return [command, stdin, stdinFile];
}

// TODO: check entire AST for ERROR/MISSING nodes
// TODO: get all command nodes
function extractCommandNodes(
  ast: Parser.Tree,
  curlCommand: string,
  warnings: Warnings
): [Parser.SyntaxNode, Word?, Word?][] {
  // https://github.com/tree-sitter/tree-sitter-bash/blob/master/grammar.js
  // The AST must be in a nice format, i.e.
  // (program
  //   (command
  //     name: (command_name (word))
  //     argument+: (
  //       word |
  //       "string" |
  //       'raw_string' |
  //       $'ansi_c_string' |
  //       $"translated_string" |
  //       ${expansion} |
  //       $simple_expansion |
  //       concatenation)))
  // or
  // (program
  //   (redirected_statement
  //     body: (command, same as above)
  //     redirect))

  // Shouldn't happen.
  if (ast.rootNode.type !== "program") {
    // TODO: better error message.
    throw new CCError(
      // TODO: expand "AST" acronym the first time it appears in an error message
      'expected a "program" top-level AST node, got ' +
        ast.rootNode.type +
        " instead"
    );
  }

  if (ast.rootNode.namedChildCount < 1 || !ast.rootNode.namedChildren) {
    // TODO: better error message.
    throw new CCError('empty "program" node');
  }

  const curlCommandLines = curlCommand.split("\n");
  let sawComment = false;
  const commands: [Parser.SyntaxNode, Word?, Word?][] = [];
  // Get top-level command and redirected_statement AST nodes, skipping comments
  for (const n of ast.rootNode.namedChildren) {
    switch (n.type) {
      case "comment":
        sawComment = true;
        continue;
      case "command":
        commands.push([n, undefined, undefined]);
        warnAboutUselessBackslash(n, curlCommandLines, warnings);
        break;
      case "redirected_statement":
        commands.push(extractRedirect(n, curlCommand, warnings));
        warnAboutUselessBackslash(n, curlCommandLines, warnings);
        break;
      case "pipeline":
        commands.push(findCurlInPipeline(n, curlCommand, warnings));
        warnAboutUselessBackslash(n, curlCommandLines, warnings);
        break;
      case "heredoc_body": // https://github.com/tree-sitter/tree-sitter-bash/issues/118
        continue;
      case "ERROR":
        throw new CCError(
          `Bash parsing error on line ${n.startPosition.row + 1}:\n` +
            underlineNode(n, curlCommand)
        );
      default:
        // TODO: better error message.
        throw new CCError(
          "found " +
            JSON.stringify(n.type) +
            ' AST node, only "command", "pipeline" or "redirected_statement" are supported\n' +
            underlineNode(n, curlCommand)
        );
    }
  }
  if (!commands.length) {
    // NOTE: if you add more node types in the `for` loop above, this error needs to be updated.
    // We would probably need to keep track of the node types we've seen.
    throw new CCError(
      'expected a "command" or "redirected_statement" AST node' +
        (sawComment ? ', only found "comment" nodes' : "")
    );
  }

  return commands;
}

function toNameAndArgv(
  command: Parser.SyntaxNode,
  curlCommand: string,
  warnings: Warnings
): [Parser.SyntaxNode, Parser.SyntaxNode[]] {
  if (command.childCount < 1) {
    // TODO: better error message.
    throw new CCError(
      'empty "command" node\n' + underlineNode(command, curlCommand)
    );
  }

  // TODO: add childrenForFieldName to tree-sitter node/web bindings
  let commandNameLoc = 0;
  // TODO: parse variable_assignment nodes and replace variables in the command
  // TODO: support file_redirect
  for (const n of command.namedChildren) {
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
      // it must be the command name
      if (n.type !== "command_name") {
        throw new CCError(
          'expected "command_name", "variable_assignment" or "file_redirect" AST node, found ' +
            n.type +
            " instead\n" +
            underlineNode(n, curlCommand)
        );
      }
      break;
    }
  }

  const [name, ...args] = command.namedChildren.slice(commandNameLoc);

  // Shouldn't happen
  if (name === undefined) {
    throw new CCError(
      'found "command" AST node with no "command_name" child\n' +
        underlineNode(command, curlCommand)
    );
  }

  return [name, args];
}

// Checks that name is "curl"
function nameToWord(
  name: Parser.SyntaxNode,
  curlCommand: string,
  warnings: Warnings
): Word {
  if (name.childCount < 1 || !name.firstChild) {
    throw new CCError(
      'found empty "command_name" AST node\n' + underlineNode(name, curlCommand)
    );
  } else if (name.childCount > 1) {
    warnings.push([
      "extra-command_name-children",
      'expected "command_name" node to only have one child but it has ' +
        name.childCount,
    ]);
  }

  const nameNode = name.firstChild;
  const nameWord = toWord(nameNode, curlCommand, warnings);
  const nameWordStr = nameWord.toString();
  const cmdNameShellToken = firstShellToken(nameWord);
  if (cmdNameShellToken) {
    // The most common reason for the command name to contain an expression
    // is probably users accidentally copying a $ from the shell prompt
    // without a space after it
    if (nameWordStr !== "$curl") {
      // TODO: or just assume it evaluates to "curl"?
      throw new CCError(
        "expected command name to be a simple value but found a " +
          cmdNameShellToken.type +
          "\n" +
          underlineNode(cmdNameShellToken.syntaxNode, curlCommand)
      );
    }
  } else if (nameWordStr.trim() !== "curl") {
    const c = nameWordStr.trim();
    if (!c) {
      throw new CCError(
        "found command without a command_name\n" +
          underlineNode(nameNode, curlCommand)
      );
    }
    throw new CCError(
      'command should begin with "curl" but instead begins with ' +
        JSON.stringify(clip(c)) +
        "\n" +
        underlineNode(nameNode, curlCommand)
    );
  }
  return nameWord;
}

export function tokenize(
  curlCommand: string,
  warnings: Warnings = []
): [Word[], Word?, Word?][] {
  const ast = parser.parse(curlCommand);
  warnAboutErrorNodes(ast, curlCommand, warnings);

  // TODO: pass syntax nodes for each token downstream and use it to
  // highlight the problematic parts in warnings/errors so that it's clear
  // which command a warning/error is for
  const commandNodes = extractCommandNodes(ast, curlCommand, warnings);
  const commands: [Word[], Word?, Word?][] = [];
  for (const [command, stdin, stdinFile] of commandNodes) {
    const [name, argv] = toNameAndArgv(command, curlCommand, warnings);
    commands.push([
      [
        nameToWord(name, curlCommand, warnings),
        ...argv.map((arg) => toWord(arg, curlCommand, warnings)),
      ],
      stdin,
      stdinFile,
    ]);
  }
  return commands;
}
