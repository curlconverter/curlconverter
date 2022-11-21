const regexEscape = /'|"|`|\\|\p{C}|\p{Z}/gu;
const regexDigit = /[0-9]/;

export const jsesc = (argument: string, quote: "'" | '"' | "`" = "'") =>
  argument.replace(regexEscape, (c: string, index: number, string: string) => {
    // \0 is null but \01 is octal
    // if we have ['\0', '1', '2']
    // if we converted it to '\\012' it would be octal
    // so it needs to be converted to '\\x0012'
    if (c === "\0" && !regexDigit.test(string.charAt(index + 1))) {
      return "\\0";
    }

    switch (c) {
      // https://mathiasbynens.be/notes/javascript-escapes#single
      case " ":
        return " ";
      case "\\":
        return "\\\\";
      case "\b":
        return "\\b";
      case "\f":
        return "\\f";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\t":
        return "\\t";
      case "\v":
        return "\\v";
      case "'":
      case '"':
      case "`":
        return c === quote ? "\\" + c : c;
    }

    if (c.length === 2) {
      const first = c.charCodeAt(0);
      const second = c.charCodeAt(1);
      return (
        "\\u" +
        first.toString(16).padStart(4, "0") +
        "\\u" +
        second.toString(16).padStart(4, "0")
      );
    }

    const hex = c.charCodeAt(0).toString(16);
    if (hex.length > 2) {
      return "\\u" + hex.padStart(4, "0");
    }
    return "\\x" + hex.padStart(2, "0");
  });

export const jsrepr = (s: string, quote?: "'" | '"' | "`") => {
  if (quote === undefined) {
    quote = "'";
    if (s.includes("'") && !s.includes('"')) {
      quote = '"';
    }
  }
  return quote + jsesc(s, quote) + quote;
};
