import { Word, Token, firstShellToken } from "./Word.js";

import { CCError } from "../util.js";
import { clip } from "../parse.js";

import parser from "./Parser.js";
import type { Parser } from "./Parser.js";

import { underlineNode, underlineNodeEnd, type Warnings } from "../Warnings.js";

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

// TODO: check entire AST for ERROR/MISSING nodes
// TODO: get all command nodes
function findFirstCommandNode(
  ast: Parser.Tree,
  curlCommand: string,
  warnings: Warnings
): [Parser.SyntaxNode, Word?, Word?] {
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

  // TODO: get only named children?
  for (const n of [ast.rootNode, ...ast.rootNode.children]) {
    if (n.type === "ERROR") {
      warnings.push([
        "bash",
        `Bash parsing error on line ${n.startPosition.row + 1}:\n` +
          underlineNode(n, curlCommand),
      ]);
      break;
    }
  }
  if (ast.rootNode.type !== "program") {
    // TODO: better error message.
    throw new CCError(
      // TODO: expand "AST" acronym the first time it appears in an error message
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

  return [command, stdin, stdinFile];
}

export function tokenize(
  curlCommand: string,
  warnings: Warnings = []
): [Word[], Word?, Word?] {
  const ast = parser.parse(curlCommand);

  const [command, stdin, stdinFile] = findFirstCommandNode(
    ast,
    curlCommand,
    warnings
  );
  if (command.childCount < 1) {
    // TODO: better error message.
    throw new CCError('empty "command" node');
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

  // None of these things should happen, but just in case
  if (name === undefined) {
    throw new CCError(
      'found "command" AST node with no "command_name" child\n' +
        underlineNode(command, curlCommand)
    );
  }
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

  const nameWord = toWord(name.firstChild, curlCommand, warnings);
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
      throw new CCError("found command without a command_name");
    }
    throw new CCError(
      'command should begin with "curl" but instead begins with ' +
        JSON.stringify(clip(c))
    );
  }

  return [
    [nameWord, ...args.map((a) => toWord(a, curlCommand, warnings))],
    stdin,
    stdinFile,
  ];
}
