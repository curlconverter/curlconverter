import * as util from "../../util.js";
import { Word } from "../../util.js";
import type { Request, Warnings } from "../../util.js";
import {
  reprObj,
  asParseFloatTimes1000,
  addImport,
  reprImportsRequire,
} from "./javascript.js";
import type { JSImports } from "./javascript.js";

import {
  reprStr,
  repr,
  reprAsStringToStringDict,
  reprStringToStringList,
  reprAsStringTuples,
} from "./javascript.js";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "max-time",
  "form",
  "form-string",
  "proxy",
  "proxy-user",
]);

// TODO: @
const _getDataString = (
  request: Request,
  imports: JSImports
): [string | null, string | null] => {
  if (!request.data) {
    return [null, null];
  }

  const originalStringRepr = repr(request.data, imports);

  const contentType = util.getContentType(request);
  // can have things like ; charset=utf-8 which we want to preserve
  const exactContentType = util.getHeader(request, "content-type");
  if (contentType === "application/json" && request.data.isString()) {
    const dataStr = request.data.toString();
    const parsed = JSON.parse(dataStr);
    // Only arrays and {} can be passed to axios to be encoded as JSON
    // TODO: check this in other generators
    if (typeof parsed !== "object" || parsed === null) {
      return [originalStringRepr, null];
    }
    const roundtrips = JSON.stringify(parsed) === dataStr;
    const jsonAsJavaScript = reprObj(parsed, 1);
    if (
      roundtrips &&
      util.eq(exactContentType, "application/json") &&
      util.eq(
        util.getHeader(request, "accept"),
        "application/json, text/plain, */*"
      )
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
      if (util.eq(exactContentType, "application/x-www-form-urlencoded")) {
        util.deleteHeader(request, "content-type");
      }

      const queryObj =
        queryDict && queryDict.every((q) => !Array.isArray(q[1]))
          ? reprAsStringToStringDict(queryDict as [Word, Word][], 1, imports)
          : reprAsStringTuples(queryList, 1, imports);
      // TODO: check roundtrip, add a comment
      return ["new URLSearchParams(" + queryObj + ")", null];
    } else {
      return [originalStringRepr, null];
    }
  }
  return [null, null];
};
const getDataString = (
  request: Request,
  imports: JSImports
): [string | null, string | null] => {
  if (!request.data) {
    return [null, null];
  }

  let dataString: string | null = null;
  let commentedOutDataString: string | null = null;
  try {
    [dataString, commentedOutDataString] = _getDataString(request, imports);
  } catch {}
  if (!dataString) {
    dataString = repr(request.data, imports);
  }
  return [dataString, commentedOutDataString];
};

const buildConfigObject = (
  request: Request,
  method: Word,
  methodStr: string,

  methods: string[],
  dataMethods: string[],
  hasSearchParams: boolean,
  imports: JSImports
): string => {
  let code = "{\n";

  if (!methods.includes(methodStr)) {
    // Axios uppercases methods
    code += "    method: " + repr(method, imports) + ",\n";
  }
  if (hasSearchParams) {
    // code += "    params,\n";
    code += "    params: params,\n";
  } else if (request.urls[0].queryDict) {
    code +=
      "    params: " +
      reprStringToStringList(request.urls[0].queryDict, 1, imports) +
      ",\n";
  }

  const [dataString, commentedOutDataString] = getDataString(request, imports); // can delete headers

  if ((request.headers && request.headers.length) || request.multipartUploads) {
    code += "    headers: {\n";
    if (request.multipartUploads) {
      code += "        ...form.getHeaders(),\n";
    }
    for (const [key, value] of request.headers || []) {
      code +=
        "        " +
        repr(key, imports) +
        ": " +
        repr(value ?? new Word(), imports) +
        ",\n";
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
    code += "        username: " + repr(username, imports);
    if (password.toBool()) {
      code += ",\n";
      code += "        password: " + repr(password, imports) + "\n";
    } else {
      code += "\n";
    }
    code += "    },\n";
  }

  if (!dataMethods.includes(methodStr)) {
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
    if (parseFloat(request.timeout.toString()) !== 0) {
      code +=
        "    timeout: " +
        asParseFloatTimes1000(request.timeout, imports) +
        ",\n";
    }
  }

  if (request.proxy && request.proxy.toString() === "") {
    // TODO: this probably won't be set if it's empty
    // TODO: could have --socks5 proxy
    code += "    proxy: false,\n";
  } else if (request.proxy) {
    // TODO: do this parsing in utils.ts
    const proxy = request.proxy.includes("://")
      ? request.proxy
      : request.proxy.prepend("http://");
    let [protocol, host] = proxy.split("://", 2);
    protocol =
      protocol.toLowerCase().toString() === "socks"
        ? new Word("socks4")
        : protocol.toLowerCase();

    let port = "1080";
    const proxyPart = host.match(/:([0-9]+$)/); // TODO: this shouldn't be a regex
    if (proxyPart) {
      host = host.slice(0, proxyPart.index);
      port = proxyPart[1];
    }

    code += "    proxy: {\n";
    code += "        protocol: " + repr(protocol, imports) + ",\n";
    code += "        host: " + repr(host, imports) + ",\n";
    if (util.isInt(port)) {
      code += "        port: " + port + ",\n";
    } else {
      code += "        port: " + reprStr(port) + ",\n";
    }
    if (request.proxyAuth) {
      const [proxyUser, proxyPassword] = request.proxyAuth.split(":", 2);
      code += "        auth: {\n";
      code += "            user: " + repr(proxyUser, imports);
      if (proxyPassword !== undefined) {
        code += ",\n";
        code += "            password: " + repr(proxyPassword, imports) + "\n";
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
        request.cookieFiles.map((c) => JSON.stringify(c.toString())).join(", "),
    ]);
  }
  if (request.urls.length > 1) {
    warnings.push([
      "multiple-urls",
      "found " +
        request.urls.length +
        " URLs, only the first one will be used: " +
        request.urls
          .map((u) => JSON.stringify(u.originalUrl.toString()))
          .join(", "),
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
  const imports: JSImports = [];

  let code = "";

  const hasSearchParams =
    request.urls[0].queryList &&
    (!request.urls[0].queryDict ||
      // https://stackoverflow.com/questions/42898009/multiple-fields-with-same-key-in-query-params-axios-request
      request.urls[0].queryDict.some((q) => Array.isArray(q[1])));
  if (hasSearchParams && request.urls[0].queryList) {
    code += "const params = new URLSearchParams();\n";
    for (const [key, value] of request.urls[0].queryList) {
      code +=
        "params.append(" +
        repr(key, imports) +
        ", " +
        repr(value, imports) +
        ");\n";
    }
    code += "\n";
  }

  if (request.multipartUploads) {
    addImport(imports, "FormData", "form-data");
    code += "const form = new FormData();\n";
    for (const m of request.multipartUploads) {
      code += "form.append(" + repr(m.name, imports) + ", ";
      if ("contentFile" in m) {
        addImport(imports, "fs", "fs");
        if (util.eq(m.contentFile, "-")) {
          code += "fs.readFileSync(0).toString()";
        } else {
          code += "fs.readFileSync(" + repr(m.contentFile, imports) + ")";
        }
        if ("filename" in m && m.filename) {
          code += ", " + repr(m.filename, imports);
        }
      } else {
        code += repr(m.content, imports);
      }
      code += ");\n";
    }
    code += "\n";
  }

  const method = request.urls[0].method.toLowerCase();
  const methodStr = method.toString();
  const methods = ["get", "delete", "head", "options", "post", "put", "patch"];
  code += "const response = await axios";
  if (methods.includes(methodStr)) {
    code += "." + methodStr;
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
    !methods.includes(methodStr) ||
    request.urls[0].queryList ||
    request.urls[0].queryDict ||
    request.headers ||
    request.urls[0].auth ||
    request.multipartUploads ||
    (request.data && !dataMethods.includes(methodStr)) ||
    request.timeout ||
    request.proxy
  );
  const needsData =
    dataMethods.includes(methodStr) &&
    (request.data || request.multipartUploads || needsConfig);

  let dataString, commentedOutDataString;
  if (needsData) {
    code += "\n";
    code += "    " + repr(url, imports) + ",\n";
    if (request.data) {
      try {
        [dataString, commentedOutDataString] = getDataString(request, imports);
        if (!dataString) {
          dataString = repr(request.data, imports);
        }
      } catch {
        dataString = repr(request.data, imports);
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
    code += repr(url, imports);
  }

  // getDataString() can delete a header, so we can end up with an empty config
  needsConfig = !!(
    !methods.includes(methodStr) ||
    request.urls[0].queryList ||
    request.urls[0].queryDict ||
    (request.headers && request.headers.length) ||
    request.urls[0].auth ||
    request.multipartUploads ||
    (request.data && !dataMethods.includes(methodStr)) ||
    request.timeout ||
    request.proxy
  );

  if (needsConfig) {
    const config = buildConfigObject(
      request,
      method,
      methodStr,
      methods,
      dataMethods,
      !!hasSearchParams,
      imports
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

  importCode += reprImportsRequire(imports);

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
