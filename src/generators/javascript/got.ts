import * as util from "../../util.js";
import { reprObj, bySecondElem } from "./javascript.js";
import type { Request, Warnings } from "../../util.js";

import { repr } from "./javascript.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,

  "max-time",
  "connect-timeout",

  "location",
  "no-location",
  "location-trusted", // not exactly supported, just better warning message
  "no-location-trusted",
  "max-redirs",

  "compressed",

  "insecure",

  "http2",
  "http2-prior-knowledge",

  "form",
  "form-string",

  // TODO:
  // "cookie-jar", // and cookie files
  // TODO: tls using https: and agent:
  // TODO: proxy stuff using agent:
  // TODO: retry:
  // TODO: methodRewriting: true to match curl?
]);

const reprAsStringToStringDict = (
  d: [string, string | null][],
  indentLevel = 0,
  indent = "    "
): string => {
  if (d.length === 0) {
    return "{}";
  }

  let code = "{\n";
  for (const [key, value] of d) {
    code +=
      indent.repeat(indentLevel + 1) +
      repr(key) +
      ": " +
      repr(value || "") +
      ",\n";
  }
  if (code.endsWith(",\n")) {
    code = code.slice(0, -2);
    code += "\n";
  }
  code += indent.repeat(indentLevel) + "}";
  return code;
};

const getBodyString = (request: Request): [string | null, string | null] => {
  // can have things like ; charset=utf-8 which we want to preserve
  const exactContentType = util.getHeader(request, "content-type");
  const contentType = util.getContentType(request);

  if (request.multipartUploads) {
    if (contentType === "multipart/form-data") {
      util.deleteHeader(request, "content-type"); // TODO: comment it out instead?
    }
    return ["body: form", null];
  }

  if (!request.data) {
    return [null, null];
  }

  // TODO: @
  const simpleString = "body: " + repr(request.data);

  try {
    if (contentType === "application/json") {
      const parsed = JSON.parse(request.data);
      const roundtrips = JSON.stringify(parsed) === request.data;
      const jsonAsJavaScript = "json: " + reprObj(parsed, 1);
      if (roundtrips && exactContentType === "application/json") {
        util.deleteHeader(request, "content-type");
      }
      return [jsonAsJavaScript, roundtrips ? null : simpleString];
    }
    if (contentType === "application/x-www-form-urlencoded") {
      const [queryList, queryDict] = util.parseQueryString(request.data);
      if (
        queryDict &&
        Object.values(queryDict).every((v) => typeof v === "string")
      ) {
        if (exactContentType === "application/x-www-form-urlencoded") {
          util.deleteHeader(request, "content-type");
        }
        return [
          "form: " +
            reprAsStringToStringDict(
              Object.entries(queryDict as { [key: string]: string }),
              1
            ),
          null,
        ];
      }
      if (queryList) {
        let paramsCode = "body: new URLSearchParams([\n";
        for (const [key, val] of queryList) {
          paramsCode += `        [${repr(key)}, ${repr(val)}],\n`;
        }
        if (paramsCode.endsWith(",\n")) {
          paramsCode = paramsCode.slice(0, -2);
          paramsCode += "\n";
        }
        paramsCode += "    ]).toString()";
        return [paramsCode, null];
      }
    }
  } catch {}

  return [simpleString, null];
};

const buildOptionsObject = (
  request: Request,
  method: string,
  methods: string[],
  nonDataMethods: string[],
  warnings: Warnings
): string => {
  let code = "{\n";

  if (!methods.includes(method.toUpperCase())) {
    code += "    method: " + repr(method) + ",\n";
  }

  if (
    request.urls[0].queryDict &&
    !Object.values(request.urls[0].queryDict).some((qv) => Array.isArray(qv))
  ) {
    code +=
      "    searchParams: " +
      reprAsStringToStringDict(
        Object.entries(request.urls[0].queryDict as { [key: string]: string }),
        1
      ) +
      ",\n";
  } else if (request.urls[0].queryList) {
    code += "    searchParams: new URLSearchParams([\n";
    for (const [key, val] of request.urls[0].queryList) {
      code += `        [${repr(key)}, ${repr(val)}],\n`;
    }
    if (code.endsWith(",\n")) {
      code = code.slice(0, -2);
      code += "\n";
    }
    code += "    ]),\n";
  }

  const [bodyString, commentedOutBodyString] = getBodyString(request); // can delete headers

  if (request.headers && request.headers.length) {
    code +=
      "    headers: " + reprAsStringToStringDict(request.headers, 1) + ",\n";
  }

  if (request.urls[0].auth) {
    const [username, password] = request.urls[0].auth;
    code += "    username: " + repr(username) + ",\n";
    if (password) {
      code += "    password: " + repr(password) + ",\n";
    }
    if (request.authType !== "basic") {
      // TODO: warn
    }
  }

  if (request.data || request.multipartUploads) {
    if (commentedOutBodyString) {
      code += "    // " + commentedOutBodyString + ",\n";
    }
    code += "    " + bodyString + ",\n";

    // TODO: Does this work for HEAD?
    if (nonDataMethods.includes(method.toUpperCase())) {
      code += "    allowGetBody: true,\n";
    }
  }

  if (request.timeout || request.connectTimeout) {
    code += "    timeout: {\n";
    if (request.timeout) {
      const timeoutAsFloat = parseFloat(request.timeout);
      if (!isNaN(timeoutAsFloat)) {
        code += "        request: " + timeoutAsFloat * 1000 + ",\n";
      } else {
        code += "        request: " + request.timeout + " * 1000,\n";
      }
    }
    if (request.connectTimeout) {
      const timeoutAsFloat = parseFloat(request.connectTimeout);
      if (!isNaN(timeoutAsFloat)) {
        code += "        connect: " + timeoutAsFloat * 1000 + ",\n";
      } else {
        code += "        connect: " + request.connectTimeout + " * 1000,\n";
      }
    }
    if (code.endsWith(",\n")) {
      code = code.slice(0, -2);
      code += "\n";
    }
    code += "    },\n";
  }

  // By default, curl doesn't follow redirects but got does.
  let followRedirects = request.followRedirects;
  if (followRedirects === undefined) {
    followRedirects = true;
  }
  let maxRedirects = request.maxRedirects;
  const hasMaxRedirects =
    followRedirects &&
    maxRedirects &&
    maxRedirects !== "0" &&
    maxRedirects !== "10"; // got default
  if (!followRedirects || maxRedirects === "0") {
    code += "    followRedirect: false,\n";
  } else if (maxRedirects) {
    if (maxRedirects === "-1") {
      maxRedirects = "Infinity";
    }
  }
  if (followRedirects && request.followRedirectsTrusted) {
    warnings.push([
      "--location-trusted",
      // TODO: is this true?
      "got doesn't have an easy way to disable removing the Authorization: header on redirect",
    ]);
  }
  if (hasMaxRedirects) {
    code += "    maxRedirects: " + maxRedirects + ",\n";
  }

  if (request.compressed === false) {
    code += "    decompress: false,\n";
  }

  if (request.insecure) {
    code += "    https: {\n";
    code += "        rejectUnauthorized: false\n";
    code += "    },\n";
  }

  if (request.http2) {
    code += "    http2: true,\n";
  }

  if (code.endsWith(",\n")) {
    code = code.slice(0, -2);
  }
  code += "\n}";
  return code;
};

export const _toNodeGot = (
  requests: Request[],
  warnings: Warnings = []
): string => {
  if (requests.length > 1) {
    warnings.push([
      "next",
      "got " +
        requests.length +
        " configs because of --next, using the first one",
    ]);
  }
  const request = requests[0];
  if (request.dataReadsFile) {
    warnings.push([
      "unsafe-data",
      // TODO: better wording
      "the data is not correct, " +
        JSON.stringify("@" + request.dataReadsFile) +
        " means it should read the file " +
        JSON.stringify(request.dataReadsFile),
    ]);
  }
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }
  if (request.urls.length > 1) {
    warnings.push([
      "multiple-urls",
      "found " +
        request.urls.length +
        " URLs, only the first one will be used: " +
        request.urls.map((u) => JSON.stringify(u.originalUrl)).join(", "),
    ]);
  }
  if (request.urls[0].queryReadsFile) {
    warnings.push([
      "unsafe-query",
      // TODO: better wording
      "the URL query string is not correct, " +
        JSON.stringify("@" + request.urls[0].queryReadsFile) +
        " means it should read the file " +
        JSON.stringify(request.urls[0].queryReadsFile),
    ]);
  }

  const imports = new Set<[string, string]>();

  let code = "";

  if (request.multipartUploads) {
    // TODO: warn that Node 18 is required for FormData
    // TODO: remove content-type header if it's multipart/form-data
    code += "const form = new FormData();\n";
    for (const m of request.multipartUploads) {
      code += "form.append(" + repr(m.name) + ", ";
      if ("contentFile" in m) {
        imports.add(["* as fs", "fs"]);
        if (m.contentFile === "-") {
          code += "fs.readFileSync(0).toString()";
        } else {
          code += "fs.readFileSync(" + repr(m.contentFile) + ")";
        }
        if ("filename" in m && m.filename) {
          code += ", " + repr(m.filename);
        }
      } else {
        code += repr(m.content);
      }
      code += ");\n";
    }
    code += "\n";
  }

  const method = request.urls[0].method;
  if (method !== method.toUpperCase()) {
    warnings.push([
      "lowercase-method",
      "got will uppercase the method: " + JSON.stringify(method),
    ]);
  }
  // https://github.com/sindresorhus/got/blob/e24b89669931b36530219b9f49965d07da25a7e6/source/create.ts#L28
  const methods = ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE"];
  // Got will error if you try sending data with these HTTP methods
  const nonDataMethods = ["GET", "HEAD"];
  code += "const response = await got";
  if (
    methods.includes(method.toUpperCase()) &&
    method.toUpperCase() !== "GET"
  ) {
    code += "." + method.toLowerCase();
  }
  code += "(";

  const url = request.urls[0].queryList
    ? request.urls[0].urlWithoutQueryList
    : request.urls[0].url;
  code += repr(url);

  const needsOptions = !!(
    !methods.includes(method.toUpperCase()) ||
    request.urls[0].queryList ||
    request.urls[0].queryDict ||
    request.headers ||
    request.urls[0].auth ||
    request.multipartUploads ||
    request.data ||
    request.followRedirects ||
    request.maxRedirects ||
    request.compressed ||
    request.insecure ||
    request.http2 ||
    request.timeout ||
    request.connectTimeout
  );
  if (needsOptions) {
    code += ", ";
    code += buildOptionsObject(
      request,
      method,
      methods,
      nonDataMethods,
      warnings
    );
  }

  code += ");\n";

  let importCode = "import got from 'got';\n";
  for (const [varName, imp] of Array.from(imports).sort(bySecondElem)) {
    importCode += "import " + varName + " from " + repr(imp) + ";\n";
  }

  return importCode + "\n" + code;
};
export const toNodeGotWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const nodeGot = _toNodeGot(requests, warnings);
  return [nodeGot, warnings];
};
export const toNodeGot = (curlCommand: string | string[]): string => {
  return toNodeGotWarn(curlCommand)[0];
};
