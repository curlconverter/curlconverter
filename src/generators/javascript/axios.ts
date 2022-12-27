import * as util from "../../util.js";
import { reprObj, bySecondElem } from "./javascript.js";
import type { Request, Warnings } from "../../util.js";

import { repr } from "./javascript.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "max-time",
  "form",
  "form-string",
  "proxy",
  "proxy-user",
]);

// TODO: @
const _getDataString = (request: Request): [string | null, string | null] => {
  if (!request.data) {
    return [null, null];
  }

  const originalStringRepr = repr(request.data);

  const contentType = util.getContentType(request);
  // can have things like ; charset=utf-8 which we want to preserve
  const exactContentType = util.getHeader(request, "content-type");
  if (contentType === "application/json") {
    const parsed = JSON.parse(request.data);
    // Only arrays and {} can be passed to axios to be encoded as JSON
    // TODO: check this in other generators
    if (typeof parsed !== "object" || parsed === null) {
      return [originalStringRepr, null];
    }
    const roundtrips = JSON.stringify(parsed) === request.data;
    const jsonAsJavaScript = reprObj(parsed, 1);
    if (
      roundtrips &&
      exactContentType === "application/json" &&
      util.getHeader(request, "accept") === "application/json, text/plain, */*"
    ) {
      util.deleteHeader(request, "content-type");
      util.deleteHeader(request, "accept");
    }
    return [jsonAsJavaScript, roundtrips ? null : originalStringRepr];
  }
  if (contentType === "application/x-www-form-urlencoded") {
    const [queryList, queryDict] = util.parseQueryString(request.data);
    if (queryList) {
      // Technically axios sends
      // application/x-www-form-urlencoded;charset=utf-8
      if (exactContentType === "application/x-www-form-urlencoded") {
        util.deleteHeader(request, "content-type");
      }

      const queryObj =
        queryDict &&
        Object.values(queryDict).every((v) => typeof v === "string")
          ? queryDict
          : queryList;
      // TODO: check roundtrip, add a comment
      return ["new URLSearchParams(" + reprObj(queryObj, 1) + ")", null];
    } else {
      return [originalStringRepr, null];
    }
  }
  return [null, null];
};
const getDataString = (request: Request): [string | null, string | null] => {
  if (!request.data) {
    return [null, null];
  }

  let dataString = null;
  let commentedOutDataString = null;
  try {
    [dataString, commentedOutDataString] = _getDataString(request);
  } catch {}
  if (!dataString) {
    dataString = repr(request.data);
  }
  return [dataString, commentedOutDataString];
};

const buildConfigObject = (
  request: Request,
  method: string,
  methods: string[],
  dataMethods: string[],
  hasSearchParams: boolean,
  warnings: Warnings
): string => {
  let code = "{\n";

  if (!methods.includes(method)) {
    // Axios uppercases methods
    code += "    method: " + repr(method) + ",\n";
  }
  if (hasSearchParams) {
    // code += "    params,\n";
    code += "    params: params,\n";
  } else if (request.urls[0].queryDict) {
    code += "    params: " + reprObj(request.urls[0].queryDict, 1) + ",\n";
  }

  const [dataString, commentedOutDataString] = getDataString(request); // can delete headers

  if ((request.headers && request.headers.length) || request.multipartUploads) {
    code += "    headers: {\n";
    if (request.multipartUploads) {
      code += "        ...form.getHeaders(),\n";
    }
    for (const [key, value] of request.headers || []) {
      code += "        " + repr(key) + ": " + repr(value || "") + ",\n";
    }
    if (code.endsWith(",\n")) {
      code = code.slice(0, -2);
      code += "\n";
    }
    code += "    },\n";
  }

  if (request.urls[0].auth) {
    const [username, password] = request.urls[0].auth;
    code += "    auth: {\n";
    code += "        username: " + repr(username);
    if (password) {
      code += ",\n";
      code += "        password: " + repr(password) + "\n";
    } else {
      code += "\n";
    }
    code += "    },\n";
  }

  if (!dataMethods.includes(method)) {
    if (request.data) {
      if (commentedOutDataString) {
        code += "    // data: " + commentedOutDataString + ",\n";
      }
      code += "    data: " + dataString + ",\n";
    } else if (request.multipartUploads) {
      code += "    data: form,\n";
    }
  }

  if (request.timeout) {
    const timeout = parseFloat(request.timeout);
    if (!isNaN(timeout) && timeout > 0) {
      code += "    timeout: " + timeout * 1000 + ",\n";
    }
  }

  if (request.proxy === "") {
    // TODO: this probably won't be set if it's empty
    // TODO: could have --socks5 proxy
    code += "    proxy: false,\n";
  } else if (request.proxy) {
    // TODO: do this parsing in utils.ts
    const proxy = request.proxy.includes("://")
      ? request.proxy
      : "http://" + request.proxy;
    let [protocol, host] = proxy.split(/:\/\/(.*)/s, 2);
    protocol =
      protocol.toLowerCase() === "socks" ? "socks4" : protocol.toLowerCase();
    host = host ? host : "";

    let port = "1080";
    const proxyPart = host.match(/:([0-9]+$)/);
    if (proxyPart) {
      host = host.slice(0, proxyPart.index);
      port = proxyPart[1];
    }

    code += "    proxy: {\n";
    code += "        protocol: " + repr(protocol) + ",\n";
    code += "        host: " + repr(host) + ",\n";
    if (util.isInt(port)) {
      code += "        port: " + port + ",\n";
    } else {
      code += "        port: " + repr(port) + ",\n";
    }
    if (request.proxyAuth) {
      const [proxyUser, proxyPassword] = request.proxyAuth.split(/:(.*)/s, 2);
      code += "        auth: {\n";
      code += "            user: " + repr(proxyUser);
      if (proxyPassword !== undefined) {
        code += ",\n";
        code += "            password: " + repr(proxyPassword) + "\n";
      } else {
        code += "\n";
      }
      code += "        },\n";
    }
    if (code.endsWith(",\n")) {
      code = code.slice(0, -2);
      code += "\n";
    }
    code += "    },\n";
  }

  if (code.endsWith(",\n")) {
    code = code.slice(0, -2);
  }
  code += "\n}";
  return code;
};

export const _toNodeAxios = (
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

  let importCode = "const axios = require('axios');\n";
  const imports = new Set<[string, string]>();

  let code = "";

  const hasSearchParams =
    request.urls[0].queryList &&
    (!request.urls[0].queryDict ||
      // https://stackoverflow.com/questions/42898009/multiple-fields-with-same-key-in-query-params-axios-request
      Object.values(request.urls[0].queryDict).some((qv) => Array.isArray(qv)));
  if (hasSearchParams && request.urls[0].queryList) {
    code += "const params = new URLSearchParams();\n";
    for (const [key, value] of request.urls[0].queryList) {
      const val = value ? value : "";
      code += "params.append(" + repr(key) + ", " + repr(val) + ");\n";
    }
    code += "\n";
  }

  if (request.multipartUploads) {
    imports.add(["FormData", "form-data"]);
    code += "const form = new FormData();\n";
    for (const m of request.multipartUploads) {
      code += "form.append(" + repr(m.name) + ", ";
      if ("contentFile" in m) {
        imports.add(["fs", "fs"]);
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

  const method = request.urls[0].method.toLowerCase();
  const methods = ["get", "delete", "head", "options", "post", "put", "patch"];
  code += "const response = await axios";
  if (methods.includes(method)) {
    code += "." + method;
  }
  code += "(";

  const url =
    request.urls[0].queryDict || hasSearchParams
      ? request.urls[0].urlWithoutQueryList
      : request.urls[0].url;

  // axios only supports posting data with these HTTP methods
  // You can also post data with OPTIONS, but that has to go in the config object
  const dataMethods = ["post", "put", "patch"];
  let needsConfig = !!(
    request.urls[0].queryList ||
    request.urls[0].queryDict ||
    request.headers ||
    request.urls[0].auth ||
    request.multipartUploads ||
    (request.data && !dataMethods.includes(method)) ||
    request.timeout ||
    request.proxy
  );
  const needsData =
    dataMethods.includes(method) &&
    (request.data || request.multipartUploads || needsConfig);

  let dataString, commentedOutDataString;
  if (needsData) {
    code += "\n";
    code += "    " + repr(url) + ",\n";
    if (request.data) {
      try {
        [dataString, commentedOutDataString] = getDataString(request);
        if (!dataString) {
          dataString = repr(request.data);
        }
      } catch {
        dataString = repr(request.data);
      }
      if (commentedOutDataString) {
        code += "    // " + commentedOutDataString + ",\n";
      }
      code += "    " + dataString;
    } else if (request.multipartUploads) {
      code += "    form";
    } else if (needsConfig) {
      // TODO: this works but maybe undefined would be more correct?
      code += "    ''";
    }
  } else {
    code += repr(url);
  }

  // getDataString() can delete a header, so we can end up with an empty config
  needsConfig = !!(
    request.urls[0].queryList ||
    request.urls[0].queryDict ||
    (request.headers && request.headers.length) ||
    request.urls[0].auth ||
    request.multipartUploads ||
    (request.data && !dataMethods.includes(method)) ||
    request.timeout ||
    request.proxy
  );

  if (needsConfig) {
    const config = buildConfigObject(
      request,
      method,
      methods,
      dataMethods,
      !!hasSearchParams,
      warnings
    );
    if (needsData) {
      code += ",\n";
      for (const line of config.split("\n")) {
        code += "    " + line + "\n";
      }
    } else {
      code += ", ";
      code += config;
    }
  } else if (needsData) {
    code += "\n";
  }

  code += ");\n";

  for (const [varName, imp] of Array.from(imports).sort(bySecondElem)) {
    importCode += "const " + varName + " = require(" + repr(imp) + ");\n";
  }

  return importCode + "\n" + code;
};
export const toNodeAxiosWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const nodeAxios = _toNodeAxios(requests, warnings);
  return [nodeAxios, warnings];
};
export const toNodeAxios = (curlCommand: string | string[]): string => {
  return toNodeAxiosWarn(curlCommand)[0];
};
