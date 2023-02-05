import {
  reprStr,
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
} from "./common.js";
import { Word } from "../../util.js";
import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

const isSupportedByWebServices = (request: Request): boolean =>
  ["get", "post", "put", "delete", "patch"].includes(
    request.urls[0].method.toLowerCase().toString()
  ) &&
  !request.multipartUploads &&
  !request.insecure;

interface Options {
  RequestMethod?: Word;

  Username?: Word;
  Password?: Word;

  UserAgent?: Word;
  MediaType?: Word;
  ContentType?: string;
  HeaderFields?: string;
}

const setHeader = (
  headers: [Word, Word][],
  header: Word,
  value: Word,
  lowercase: boolean
) => {
  headers.push([lowercase ? header.toLowerCase() : header, value]);
};

const parseWebOptions = (request: Request): Options => {
  const options: Options = {};

  // MATLAB uses GET in `webread` and POST in `webwrite` by default
  // thus, it is necessary to set the method for other requests
  const method = request.urls[0].method.toLowerCase().toString();
  if (method !== "get" && method !== "post") {
    options.RequestMethod = request.urls[0].method.toLowerCase();
  }

  const headers: [Word, Word][] = [];
  const preformattedHeaders: string[] = [];
  if (request.urls[0].auth) {
    const [username, password] = request.urls[0].auth;
    if (username.length) {
      options.Username = username;
      options.Password = password;
    } else {
      util._setHeaderIfMissing(
        headers,
        "Authorization",
        `['Basic ' matlab.net.base64encode(${repr(
          util.joinWords(request.urls[0].auth, ":")
        )})]`,
        request.lowercaseHeaders
      );
      preformattedHeaders.push("authorization");
    }
  }

  if (request.headers) {
    for (const [header, value] of request.headers) {
      if (value === null) {
        continue;
      }
      // Doing this case insensitively probably makes MATLAB send title-cased headers
      switch (header.toLowerCase().toString()) {
        case "user-agent":
          options.UserAgent = value;
          break;
        case "content-type":
          options.MediaType = value;
          break;
        case "cookie":
          if (request.cookies) {
            util._setHeaderIfMissing(
              headers,
              "Cookie",
              cookieString,
              request.lowercaseHeaders
            );
            preformattedHeaders.push("cookie");
          } else {
            setHeader(headers, header, value, request.lowercaseHeaders);
          }
          break;
        case "accept":
          switch (value.toLowerCase().toString()) {
            case "application/json":
              options.ContentType = "json";
              break;
            case "text/csv":
              options.ContentType = "table";
              break;
            case "text/plain":
            case "text/html":
            case "application/javascript":
            case "application/x-javascript":
            case "application/x-www-form-urlencoded":
              options.ContentType = "text";
              break;
            case "text/xml":
            case "application/xml":
              options.ContentType = "xmldom";
              break;
            case "application/octet-stream":
              options.ContentType = "binary";
              break;
            default:
              if (value.startsWith("image/")) {
                options.ContentType = "image";
              } else if (value.startsWith("audio/")) {
                options.ContentType = "audio";
              } else {
                setHeader(headers, header, value, request.lowercaseHeaders);
              }
          }
          break;
        default:
          setHeader(headers, header, value, request.lowercaseHeaders);
      }
    }
  }

  if (headers.length > 0) {
    // If key is on the same line as 'weboptions', there is only one parameter
    // otherwise keys are indented by one level in the next line.
    // An extra indentation level is given to the values's new lines in cell array
    const indentLevel = 1 + (Object.keys(options).length === 0 ? 0 : 1);
    options.HeaderFields = addCellArray(
      headers,
      preformattedHeaders,
      indentLevel
    );
  }

  return options;
};

const prepareOptions = (request: Request, options: Options): string[] => {
  const lines: string[] = [];
  if (Object.keys(options).length === 0) {
    return lines;
  }
  const pairValues = addCellArray(
    Object.entries(options),
    ["headerfields"],
    1,
    true
  );
  lines.push(callFunction("options", "weboptions", pairValues));

  return lines;
};

const prepareBasicURI = (request: Request): string[] => {
  const response: string[] = [];
  if (request.urls[0].queryList) {
    response.push(
      setVariableValue("baseURI", repr(request.urls[0].urlWithoutQueryList))
    );
    response.push(setVariableValue("uri", `[baseURI '?' ${paramsString}]`));
  } else {
    response.push(setVariableValue("uri", repr(request.urls[0].url)));
  }
  return response;
};

const prepareBasicData = (request: Request): string | string[] => {
  if (request.data && request.data.length === 0) {
    return setVariableValue("body", repr(new Word()));
  }
  if (!request.data) {
    return [];
  }
  let response: string | string[] = [];
  if (request.data.charAt(0) === "@") {
    response.push(
      callFunction("body", "fileread", repr(request.data.slice(1)))
    );

    if (!request.isDataBinary) {
      response.push(setVariableValue("body(body==13 | body==10)", "[]"));
    }
  } else if (request.data.isString()) {
    // if the data is in JSON, store it as struct in MATLAB
    // otherwise just keep it as a char vector
    try {
      const jsonData = JSON.parse(request.data?.toString());
      if (typeof jsonData === "object") {
        let jsonText = structify(jsonData);
        if (!jsonText.startsWith("struct")) jsonText = reprStr(jsonText);
        response = setVariableValue("body", jsonText);
      } else {
        response = setVariableValue("body", repr(request.data));
      }
    } catch (e) {
      response = setVariableValue("body", repr(request.data));
    }
  }
  return response;
};

const prepareWebCall = (request: Request, options: Options): string[] => {
  const lines: string[] = [];
  const webFunction = containsBody(request) ? "webwrite" : "webread";

  const params = ["uri"];
  if (containsBody(request)) {
    params.push("body");
  }
  if (Object.keys(options).length > 0) {
    params.push("options");
  }
  lines.push(callFunction("response", webFunction, params));

  return lines;
};

export const toWebServices = (
  request: Request,
  warnings: Warnings
): [(string | string[] | null)[], Warnings] => {
  let lines: (string | string[] | null)[] = [
    "%% Web Access using Data Import and Export API",
  ];

  if (!isSupportedByWebServices(request)) {
    lines.push("% This is not possible with the webread/webwrite API");
    return [lines, warnings];
  }

  const options = parseWebOptions(request);
  lines = lines.concat([
    prepareQueryString(request),
    prepareCookies(request),
    prepareBasicURI(request),
    prepareBasicData(request),
    prepareOptions(request, options),
    prepareWebCall(request, options),
  ]);

  return [lines, warnings];
};
