import {
  repr,
  setVariableValue,
  callFunction,
  structify,
  containsBody,
  prepareQueryString,
  prepareCookies,
} from "./common.js";
import type { Request, Warnings } from "../../util.js";

const prepareHeaders = (request: Request): string | null => {
  let response = null;

  if (request.headers) {
    // cookies are part of headers
    const headerCount = request.headers.length + (request.cookies ? 1 : 0);

    const headers = [];
    let header = headerCount === 1 ? "" : "[";

    for (const [key, value] of request.headers) {
      if (value === null) {
        continue;
      }
      switch (key) {
        case "Cookie":
          break;
        case "Accept": {
          const accepts = value.split(",");
          if (accepts.length === 1) {
            headers.push(`field.AcceptField(MediaType(${repr(value)}))`);
          } else {
            let acceptheader = "field.AcceptField([";
            for (const accept of accepts) {
              acceptheader += `\n        MediaType(${repr(accept.trim())})`;
            }
            acceptheader += "\n    ])";
            headers.push(acceptheader);
          }
          break;
        }
        default:
          headers.push(`HeaderField(${repr(key)}, ${repr(value)})`);
      }
    }

    if (headerCount === 1) {
      header += headers.pop();
    } else {
      header += "\n    " + headers.join("\n    ");
      if (request.cookies) {
        const cookieFieldParams = callFunction(
          null,
          "cellfun",
          [
            "@(x) Cookie(x{:})",
            callFunction(null, "num2cell", ["cookies", "2"], ""),
          ],
          ""
        );
        header +=
          "\n    " +
          callFunction(null, "field.CookieField", cookieFieldParams, "");
      }
      header += "\n]'";
    }
    response = setVariableValue("header", header);
  }

  return response;
};

const prepareURI = (request: Request) => {
  const uriParams = [];
  if (request.queryDict) {
    uriParams.push(repr(request.urlWithoutQuery));
    uriParams.push("QueryParameter(params')");
  } else {
    uriParams.push(repr(request.url));
  }
  return callFunction("uri", "URI", uriParams);
};

const prepareAuth = (request: Request): string[] => {
  const options = [];
  const optionsParams = [];
  if (request.auth) {
    const [usr, pass] = request.auth;
    const userfield = `'Username', ${repr(usr)}`;
    const passfield = `'Password', ${repr(pass)}`;
    const authparams = (usr ? `${userfield}, ` : "") + passfield;
    optionsParams.push(repr("Credentials"), "cred");
    options.push(callFunction("cred", "Credentials", authparams));
  }

  if (request.insecure) {
    optionsParams.push(repr("VerifyServerName"), "false");
  }

  if (optionsParams.length > 0) {
    options.push(callFunction("options", "HTTPOptions", optionsParams));
  }

  return options;
};

const prepareMultipartUploads = (request: Request): string | null => {
  let response = null;
  if (request.multipartUploads) {
    const params: [string, string][] = [];
    for (const m of request.multipartUploads) {
      const value = "contentFile" in m ? "@" + m.contentFile : m.content; // TODO: something nicer
      const fileProvider = prepareDataProvider(
        value,
        null,
        "",
        1,
        true,
        !("contentFile" in m)
      );
      params.push([repr(m.name), fileProvider as string]); // TODO: can this be not a string?
    }
    response = callFunction("body", "MultipartFormProvider", params);
  }

  return response;
};

const isJsonString = (str: string): boolean => {
  // Source: https://stackoverflow.com/a/3710226/5625738
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const prepareDataProvider = (
  value: string,
  output: string | null,
  termination: string,
  indentLevel: number,
  isDataBinary?: boolean,
  isDataRaw?: boolean
): string | string[] => {
  if (typeof indentLevel === "undefined" || indentLevel === null)
    indentLevel = 0;
  if (typeof isDataBinary === "undefined") isDataBinary = true;
  if (!isDataRaw && value[0] === "@") {
    const filename = value.slice(1);
    // >> imformats % for seeing MATLAB supported image formats
    const isImageProvider = new Set(["jpeg", "jpg", "png", "tif", "gif"]).has(
      filename.split(".")[1]
    );
    const provider = isImageProvider ? "ImageProvider" : "FileProvider";
    if (!isDataBinary) {
      return [
        callFunction(output, "fileread", repr(filename)),
        setVariableValue(`${output}(${output}==13 | ${output}==10)`, "[]"),
      ];
    }
    return callFunction(output, provider, repr(filename), termination);
  }

  if (value === "") {
    return callFunction(output, "FileProvider", "", termination);
  }

  if (typeof value !== "number" && isJsonString(value)) {
    const obj = JSON.parse(value);
    // If fail to create a struct for the JSON, then return a string
    try {
      const structure = structify(obj, indentLevel);
      return callFunction(output, "JSONProvider", structure, termination);
    } catch (e) {
      return callFunction(output, "StringProvider", repr(value), termination);
    }
  }

  if (typeof value === "number") {
    return callFunction(output, "FormProvider", repr(value), termination);
  }
  const formValue = value
    .split("&")
    .map((x) => x.split("=").map((x) => repr(x)));
  return callFunction(output, "FormProvider", formValue, termination);
};

const prepareData = (request: Request) => {
  let response = null;
  if (request.dataArray) {
    const data = request.dataArray.map((x: string) =>
      x.split("=").map((x) => {
        let ans = repr(x);
        try {
          const jsonData = JSON.parse(x);
          if (typeof jsonData === "object") {
            ans = callFunction(
              null,
              "JSONProvider",
              structify(jsonData, 1),
              ""
            );
          }
        } catch (e) {}

        return ans;
      })
    );

    response = callFunction("body", "FormProvider", data);
  } else if (Object.prototype.hasOwnProperty.call(request, "data")) {
    response = prepareDataProvider(
      request.data as string,
      "body",
      ";",
      0,
      !!request.isDataBinary,
      !!request.isDataRaw
    );
    if (!response) {
      response = setVariableValue("body", repr(request.data));
    }
  }
  return response;
};

const prepareRequestMessage = (request: Request): string => {
  let reqMessage: string[] | string = [repr(request.method.toLowerCase())];
  if (request.cookies || request.headers) {
    reqMessage.push("header");
  } else if (request.method.toLowerCase() === "get") {
    reqMessage = "";
  }
  if (containsBody(request)) {
    if (reqMessage.length === 1) {
      // TODO: this could be a string actually
      (reqMessage as string[]).push("[]");
    }
    (reqMessage as string[]).push("body");
  }

  // list as many params as necessary
  const params = ["uri.EncodedURI"];
  if (request.auth || request.insecure) {
    params.push("options");
  }

  const response = [
    callFunction(
      "response",
      "RequestMessage",
      reqMessage,
      callFunction(null, ".send", params)
    ),
  ];

  return response.join("\n");
};

export const toHTTPInterface = (
  request: Request,
  warnings: Warnings
): [(string | string[] | null)[], Warnings] => {
  return [
    [
      "%% HTTP Interface",
      "import matlab.net.*",
      "import matlab.net.http.*",
      containsBody(request) ? "import matlab.net.http.io.*" : null,
      "",
      prepareQueryString(request),
      prepareCookies(request),
      prepareHeaders(request),
      prepareURI(request),
      prepareAuth(request),
      prepareMultipartUploads(request),
      prepareData(request),
      prepareRequestMessage(request),
      "",
    ],
    warnings,
  ];
};
