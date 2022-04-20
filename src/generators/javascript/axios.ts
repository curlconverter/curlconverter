import * as util from "../../util.js";
import type { Request, Warnings } from "../../util.js";

import jsesc from "jsesc";

const supportedArgs = new Set([
  "url",
  "request",
  "user-agent",
  "cookie",
  "data",
  "data-raw",
  "data-ascii",
  "data-binary",
  "data-urlencode",
  "json",
  "form",
  "form-string",
  "referer",
  "get",
  "header",
  "head",
  "no-head",
  "user",
  "proxy",
  "proxy-user",
  "max-time",
]);

const repr = (value: string | object, indentLevel?: number): string => {
  const escaped = jsesc(value, {
    quotes: "single",
    minimal: false,
    compact: false,
    indent: "    ",
    indentLevel: indentLevel ? indentLevel : 0,
  });
  if (typeof value === "string") {
    return "'" + escaped + "'";
  }
  return escaped;
};

export const _toJavaScriptAxios = (
  request: Request,
  warnings?: Warnings
): [string, Warnings] => {
  warnings = warnings || [];
  let code = "const axios = require('axios');\n\n";

  const needsConfig =
    request.queryDict ||
    request.headers ||
    request.auth ||
    request.data ||
    request.multipartUploads ||
    request.timeout ||
    request.proxy;

  if (request.method.toLowerCase() === "get" && !needsConfig) {
    code += "const response = await axios(" + repr(request.url) + ");\n";
    return [code, warnings];
  }

  if (request.multipartUploads) {
    code += "const formData = new FormData();\n";
    for (const {
      name,
      filename,
      content,
      contentFile,
    } of request.multipartUploads) {
      code += "formData.append(" + repr(name) + ", ";
      if (content) {
        code += repr(content);
      } else {
        // TODO: users need to implement this function, we could read it with fs
        // for them if we're on Node and fetch() it in the browser
        code += "readFile(" + repr(contentFile as string) + ")";
      }
      if (filename && filename !== name) {
        code += ", " + repr(filename);
      }
      code += ");\n";
    }
    code += "\n";
  }

  // TODO: keep JSON as-is
  // if (request.data) {
  //   // escape single quotes if there are any in there
  //   if (request.data.indexOf("'") > -1) {
  //     request.data = jsesc(request.data);
  //   }
  //   try {
  //     JSON.parse(request.data);
  //     if (!request.headers) {
  //       request.headers = [];
  //     }
  //     if (!util.hasHeader(request, "Content-Type")) {
  //       request.headers.push([
  //         "Content-Type",
  //         "application/json; charset=UTF-8",
  //       ]);
  //     }
  //     request.data = "JSON.stringify(" + request.data.trim() + ")";
  //   } catch {
  //     request.data = repr(request.data);
  //   }
  // }

  const methods = ["get", "delete", "head", "options", "post", "put", "patch"];
  let fn = "request";
  if (methods.includes(request.method.toLowerCase())) {
    fn = request.method.toLowerCase();
  }

  code += "const response = await axios." + fn + "(";
  code += repr(request.queryDict ? request.urlWithoutQuery : request.url);

  if (fn === "request" || needsConfig) {
    code += ", {\n";
    if (fn === "request") {
      // Axios probably uppercases methods
      code += "    method: " + repr(request.method.toLowerCase()) + ",\n";
    }
    if (request.queryDict) {
      code += "    params: " + repr(request.queryDict, 1) + ",\n";
    }

    if (request.headers) {
      code +=
        "    headers: " + repr(Object.fromEntries(request.headers), 1) + ",\n";
    }

    if (request.auth) {
      const [username, password] = request.auth;
      const auth = { username, password };
      if (password) {
        auth.password = password;
      }
      code += "    auth: {\n";
      code += "        username: " + repr(username);
      if (password) {
        code += ",\n";
        code += "        password: " + repr(password) + ",\n";
      } else {
        code += "\n";
      }
      code += "    },\n";
    }

    if (request.multipartUploads) {
      code += "    data: formData,\n";
    } else if (request.data) {
      // TODO: make this a dict if possible
      code += "    data: " + repr(request.data) + ",\n";
    }

    if (request.timeout && parseFloat(request.timeout) > 0) {
      const timeout = parseFloat(request.timeout);
      if (!isNaN(timeout) && timeout > 0) {
        code += "    timeout: " + timeout * 1000 + ",\n";
      }
    }

    if (request.proxy === "") {
      code += "    proxy: false,\n"; // TODO: could have --socks5 proxy
    } else if (request.proxy) {
      const proxy = request.proxy.includes("://")
        ? request.proxy
        : "http://" + request.proxy;
      let [protocol, host] = proxy.split(/:\/\/(.*)/s, 2);
      protocol =
        protocol.toLowerCase() === "socks" ? "socks4" : protocol.toLowerCase();

      let port = "1080";
      const proxyPart = (host as string).match(/:([0-9]+$)/);
      if (proxyPart) {
        host = host.slice(0, proxyPart.index);
        port = proxyPart[1];
      }

      const portInt = parseInt(port);

      code += "    proxy: {\n";
      code += "        protocol: " + repr(protocol) + ",\n";
      code += "        host: " + repr(host) + ",\n";
      if (!isNaN(portInt)) {
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
  }

  code += ");\n";

  return [code, warnings];
};
export const toJavaScriptAxiosWarn = (
  curlCommand: string | string[]
): [string, Warnings] => {
  const [request, warnings] = util.parseCurlCommand(curlCommand, supportedArgs);
  return _toJavaScriptAxios(request, warnings);
};
export const toJavaScriptAxios = (curlCommand: string | string[]): string => {
  return toJavaScriptAxiosWarn(curlCommand)[0];
};
