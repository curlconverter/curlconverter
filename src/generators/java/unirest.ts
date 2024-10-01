import type { Request, Warnings } from "../../parse.js";
import { COMMON_SUPPORTED_ARGS, getFirst, parse } from "../../parse.js";
import { Word } from "../../shell/Word.js";
import { parseQueryString } from "../../Query.js";
import { repr } from "./java.js";

export const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "max-time",
  "connect-timeout",
  "location",
  "location-trusted",
  "upload-file",
  "form",
  "form-string",
  "proxy",
  "proxy-user",
]);

export function _toJavaUnirest(
  requests: Request[],
  warnings: Warnings = [],
): string {
  const request = getFirst(requests, warnings);
  const url = request.urls[0];

  const imports = new Set<string>([
    "kong.unirest.HttpResponse",
    "kong.unirest.Unirest",
  ]);
  const exceptions = new Set<string>();

  let javaCode = "";

  const configLines = [];
  if (request.timeout) {
    const timeout = parseInt(request.timeout.toString());
    configLines.push(`.socketTimeout(${isNaN(timeout) ? 0 : timeout * 1000})`);
  }
  if (request.connectTimeout) {
    const connectTimeout = parseInt(request.connectTimeout.toString());
    configLines.push(
      `.connectTimeout(${isNaN(connectTimeout ? 0 : connectTimeout * 1000)})`,
    );
  }
  if (request.followRedirects === false) {
    configLines.push(".followRedirects(false)");
  }
  if (request.proxy) {
    const supportProxyProtocols = ["http", "https"];
    const proxy = request.proxy.includes("://")
      ? request.proxy
      : request.proxy.prepend("http://");
    let [protocol, host] = proxy.split("://", 2);
    protocol =
      protocol.toLowerCase().toString() === "socks"
        ? new Word("socks4")
        : protocol.toLowerCase();

    if (supportProxyProtocols.includes(protocol.toString())) {
      let port = "80";
      const proxyPart = host.match(/:([0-9]+$)/);
      if (proxyPart) {
        host = host.slice(0, proxyPart.index);
        port = proxyPart[1];
      }
      const proxyArgs = [repr(host, imports), port];
      if (request.proxyAuth) {
        const [proxyUser, proxyPassword] = request.proxyAuth.split(":", 2);
        proxyArgs.push(repr(proxyUser, imports), repr(proxyPassword, imports));
      }
      configLines.push(`.proxy(${proxyArgs.join(", ")})`);
    } else {
      warnings.push([
        "unirest-unsupported-proxy-protocol",
        "Unirest doesn't support proxy protocol " + protocol.toString(),
      ]);
    }
  }
  if (configLines.length) {
    javaCode += `Unirest.config()
            ${configLines.join("\n            ")};
    `;
  }
  javaCode += `    HttpResponse<String> httpResponse
               = Unirest.${url.method.toLowerCase().toString()}(${repr(
                 url.url,
                 imports,
               )})
`;

  const requestLines = [];
  if (url.auth) {
    const [name, password] = url.auth;
    requestLines.push(
      `.basicAuth(${repr(name, imports)}, ${repr(password, imports)})`,
    );
  }

  if (request.headers.length) {
    for (const [headerName, headerValue] of request.headers) {
      if (headerValue === null) {
        continue;
      }
      requestLines.push(
        `.header(${repr(headerName, imports)}, ${repr(headerValue, imports)})`,
      );
    }
  }

  if (url.uploadFile) {
    imports.add("java.io.File");
    imports.add("java.io.FileInputStream");
    imports.add("java.io.FileNotFoundException");
    exceptions.add("FileNotFoundException");
    requestLines.push(
      `.body(new FileInputStream(new File(${repr(url.uploadFile, imports)})))`,
    );
  } else if (
    request.dataArray &&
    request.dataArray.length === 1 &&
    !(request.dataArray[0] instanceof Word) &&
    !request.dataArray[0].name
  ) {
    //   todo
  } else if (request.data) {
    const contentType = request.headers.getContentType();
    if (contentType === "application/x-www-form-urlencoded") {
      const [queryList] = parseQueryString(request.data);
      if (queryList) {
        for (const [name, value] of queryList) {
          requestLines.push(
            `.field(${repr(name, imports)},${repr(value, imports)})`,
          );
        }
      } else {
        requestLines.push(`.body(${repr(request.data, imports)})`);
      }
    } else {
      requestLines.push(`.body(${repr(request.data, imports)})`);
    }
  } else if (request.multipartUploads) {
    for (const m of request.multipartUploads) {
      if ("content" in m) {
        requestLines.push(
          `.field(${repr(m.name, imports)},${repr(m.content, imports)})`,
        );
      } else {
        imports.add("java.io.File");
        imports.add("java.io.FileInputStream");
        imports.add("java.io.FileNotFoundException");
        exceptions.add("FileNotFoundException");
        requestLines.push(
          `.field(${repr(m.name, imports)}, new FileInputStream(new File(${repr(
            m.contentFile,
            imports,
          )})), ${m.filename ? repr(m.filename, imports) : ""})`,
        );
      }
    }
  }

  if (requestLines.length) {
    javaCode += `            ${requestLines.join("\n            ")}\n`;
  }
  javaCode += `            .asString();`;

  let preambleCode = "";
  for (const imp of Array.from(imports).sort()) {
    preambleCode += "import " + imp + ";\n";
  }
  if (imports.size) {
    preambleCode += "\n";
  }

  let throws = "";
  if (exceptions.size) {
    throws += `throws ${Array.from(exceptions).join(", ")} `;
  }

  preambleCode += `class Main {
    public static void main(String[] args) ${throws}{
        ${javaCode}
    }
}\n`;

  return preambleCode;
}

export function toJavaUnirestWarn(
  curlCommand: string | string[],
  warnings: Warnings = [],
): [string, Warnings] {
  const requests = parse(curlCommand, supportedArgs, warnings);
  const java = _toJavaUnirest(requests, warnings);
  return [java, warnings];
}

export function toJavaUnirest(curlCommand: string | string[]): string {
  return toJavaUnirestWarn(curlCommand)[0];
}
