import {
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
import type { Request, Warnings } from "../../util.js";

const isSupportedByWebServices = (request: Request): boolean => {
  if (
    !new Set(["get", "post", "put", "delete", "patch"]).has(
      request.method.toLowerCase()
    )
  ) {
    return false;
  }
  return !request.multipartUploads && !request.insecure;
};

const parseWebOptions = (request: Request): { [key: string]: string } => {
  const options: { [key: string]: string } = {};

  // MATLAB uses GET in `webread` and POST in `webwrite` by default
  // thus, it is necessary to set the method for other requests
  if (
    request.method.toLowerCase() !== "get" &&
    request.method.toLowerCase() !== "post"
  ) {
    options.RequestMethod = request.method.toLowerCase();
  }

  const headers: { [key: string]: string } = {};
  if (request.auth) {
    const [username, password] = request.auth;
    if (username !== "") {
      options.Username = username;
      options.Password = password;
    } else {
      headers.Authorization = `['Basic ' matlab.net.base64encode(${repr(
        username + ":" + password
      )})]`;
    }
  }

  if (request.headers) {
    for (const [key, value] of request.headers) {
      if (value === null) {
        continue;
      }
      switch (key) {
        case "User-Agent":
        case "user-agent":
          options.UserAgent = value;
          break;
        case "Content-Type":
          options.MediaType = value;
          break;
        case "Cookie":
          headers.Cookie = value;
          break;
        case "Accept":
          switch (value) {
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
                headers[key] = value;
              }
          }
          break;
        default:
          headers[key] = value;
      }
    }
  }

  if (request.cookies) {
    headers.Cookie = cookieString;
  }

  if (Object.entries(headers).length > 0) {
    // If key is on the same line as 'weboptions', there is only one parameter
    // otherwise keys are indented by one level in the next line.
    // An extra indentation level is given to the values's new lines in cell array
    const indentLevel = 1 + (Object.keys(options).length === 0 ? 0 : 1);
    options.HeaderFields = addCellArray(
      headers,
      ["Authorization", "Cookie"],
      "",
      indentLevel
    );
  }

  return options;
};

const prepareOptions = (
  request: Request,
  options: { [key: string]: string }
): string[] => {
  const lines: string[] = [];
  if (Object.keys(options).length === 0) {
    return lines;
  }
  const pairValues = addCellArray(options, ["HeaderFields"], ",", 1, true);
  lines.push(callFunction("options", "weboptions", pairValues));

  return lines;
};

const prepareBasicURI = (request: Request): string[] => {
  const response = [];
  if (request.queryDict) {
    response.push(setVariableValue("baseURI", repr(request.urlWithoutQuery)));
    response.push(setVariableValue("uri", `[baseURI '?' ${paramsString}]`));
  } else {
    response.push(setVariableValue("uri", repr(request.url)));
  }
  return response;
};

const prepareBasicData = (request: Request): string | string[] => {
  let response: string | string[] = [];
  if (Object.prototype.hasOwnProperty.call(request, "data")) {
    if (request.data === "") {
      response = setVariableValue("body", repr());
    } else if ((request.data as string)[0] === "@") {
      response.push(
        callFunction(
          "body",
          "fileread",
          repr((request.data as string).slice(1))
        )
      );

      if (!request.isDataBinary) {
        response.push(setVariableValue("body(body==13 | body==10)", "[]"));
      }
    } else {
      // if the data is in JSON, store it as struct in MATLAB
      // otherwise just keep it as a char vector
      try {
        const jsonData = JSON.parse(request.data as string);
        if (typeof jsonData === "object") {
          let jsonText = structify(jsonData);
          if (!jsonText.startsWith("struct")) jsonText = repr(jsonText);
          response = setVariableValue("body", jsonText);
        } else {
          response = setVariableValue("body", repr(request.data));
        }
      } catch (e) {
        response = setVariableValue("body", repr(request.data));
      }
    }
  }
  return response;
};

const prepareWebCall = (
  request: Request,
  options: { [key: string]: string }
): string[] => {
  const lines = [];
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
