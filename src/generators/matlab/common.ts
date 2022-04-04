import { CCError } from "../../util.js";
import type { Request } from "../../util.js";

import jsesc from "jsesc";

const repr = (value?: string | null) => {
  // In context of url parameters, don't accept nulls and such.
  if (!value) {
    return "''";
  }

  return "'" + jsesc(value, { quotes: "single" }).replace(/\\'/g, "''") + "'";
};

const setVariableValue = (
  outputVariable: string | null,
  value: string,
  termination?: string
): string => {
  let result = "";

  if (outputVariable) {
    result += outputVariable + " = ";
  }

  result += value;
  result +=
    typeof termination === "undefined" || termination === null
      ? ";"
      : termination;
  return result;
};

const callFunction = (
  outputVariable: string | null,
  functionName: string,
  params: string | string[] | string[][],
  termination?: string
) => {
  let functionCall = functionName + "(";
  if (Array.isArray(params)) {
    const singleLine = params
      .map((x) => (Array.isArray(x) ? x.join(", ") : x))
      .join(", ");
    const indentLevel = 1;
    const indent = " ".repeat(4 * indentLevel);
    const skipToNextLine = "...\n" + indent;
    let multiLine = skipToNextLine;
    multiLine += params
      .map((x) => (Array.isArray(x) ? x.join(", ") : x))
      .join("," + skipToNextLine);
    multiLine += "...\n";

    // Split the params in multiple lines - if one line is not enough
    const combinedSingleLineLength =
      [outputVariable, functionName, singleLine]
        .map((x) => (x ? x.length : 0))
        .reduce((x, y) => x + y) +
      (outputVariable ? 3 : 0) +
      2 +
      (termination ? termination.length : 1);
    functionCall += combinedSingleLineLength < 120 ? singleLine : multiLine;
  } else {
    functionCall += params;
  }
  functionCall += ")";
  return setVariableValue(outputVariable, functionCall, termination);
};

const addCellArray = (
  mapping: { [key: string]: string | null | (null | string)[] },
  keysNotToQuote: string[],
  keyValSeparator: string,
  indentLevel: number,
  pairs?: boolean
) => {
  const indentUnit = " ".repeat(4);
  const indent = indentUnit.repeat(indentLevel);
  const indentPrevLevel = indentUnit.repeat(indentLevel - 1);

  const entries = Object.entries(mapping);
  if (entries.length === 0) return "";

  let response = pairs ? "" : "{";
  if (entries.length === 1) {
    const [key, value] = entries.pop() as [string, string];
    let val = value;
    if (keysNotToQuote && !keysNotToQuote.includes(key)) val = `${repr(value)}`;
    response += `${repr(key)}${keyValSeparator} ${val}`;
  } else {
    if (pairs) response += "...";
    let counter = entries.length;
    for (const [key, value] of entries) {
      let val = value;
      if (val === null) {
        continue;
      }
      --counter;
      if (keysNotToQuote && !keysNotToQuote.includes(key)) {
        if (typeof val === "object") {
          val = `[${val.map(repr).join()}]`;
        } else {
          val = `${repr(val)}`;
        }
      }
      response += `\n${indent}${repr(key)}${keyValSeparator} ${val}`;
      if (pairs) {
        if (counter !== 0) response += ",";
        response += "...";
      }
    }
    response += `\n${indentPrevLevel}`;
  }
  response += pairs ? "" : "}";
  return response;
};

const structify = (
  obj: number[] | string[] | { [key: string]: string } | string | number | null,
  indentLevel?: number
) => {
  let response = "";
  indentLevel = !indentLevel ? 1 : ++indentLevel;
  const indent = " ".repeat(4 * indentLevel);
  const prevIndent = " ".repeat(4 * (indentLevel - 1));

  if (obj instanceof Array) {
    const list = [];
    let listContainsNumbers = true;
    for (const k in obj) {
      if (listContainsNumbers && typeof obj[k] !== "number") {
        listContainsNumbers = false;
      }
      const value = structify(obj[k], indentLevel);
      list.push(`${value}`);
    }
    if (listContainsNumbers) {
      const listString = list.join(" ");
      response += `[${listString}]`;
    } else {
      list.unshift("{{");
      const listString = list.join(`\n${indent}`);
      response += `${listString}\n${prevIndent}}}`;
    }
  } else if (obj instanceof Object) {
    response += "struct(...";
    let first = true;
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        if (!k[0].match(/[a-z]/i)) {
          throw new CCError(
            "MATLAB structs do not support keys starting with non-alphabet symbols"
          );
        }
        // recursive call to scan property
        if (first) {
          first = false;
        } else {
          response += ",...";
        }
        response += `\n${indent}`;
        response += `'${k}', `;
        response += structify(obj[k], indentLevel);
      }
    }
    response += "...";
    response += `\n${prevIndent})`;
  } else if (typeof obj === "number") {
    // not an Object so obj[k] here is a value
    response += `${obj}`;
  } else {
    response += `${repr(obj)}`;
  }

  return response;
};

const containsBody = (request: Request): boolean => {
  return Boolean(
    Object.prototype.hasOwnProperty.call(request, "data") ||
      request.multipartUploads
  );
};

const prepareQueryString = (request: Request): string | null => {
  if (request.queryDict) {
    const params = addCellArray(request.queryDict, [], "", 1);
    return setVariableValue("params", params);
  }
  return null;
};

const prepareCookies = (request: Request): string | null => {
  if (request.cookies) {
    // TODO: throws away repeat cookies
    const cookies = addCellArray(
      Object.fromEntries(request.cookies),
      [],
      "",
      1
    );
    return setVariableValue("cookies", cookies);
  }
  return null;
};

const cookieString = "char(join(join(cookies, '='), '; '))";
const paramsString = "char(join(join(params, '='), '&'))";

export {
  repr,
  setVariableValue,
  callFunction,
  addCellArray,
  structify,
  containsBody,
  prepareQueryString,
  prepareCookies,
  cookieString,
  paramsString,
};
