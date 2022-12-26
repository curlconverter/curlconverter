import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

import yaml from "yamljs";

const supportedArgs = new Set([
  ...util.COMMON_SUPPORTED_ARGS,
  "insecure",
  "no-insecure",
  // "form",
  // "form-string",
]);

function getDataString(request: Request): [string, boolean] | undefined {
  if (!request.data) {
    return;
  }

  if (!request.isDataRaw && request.data === "@-") {
    if (request.stdinFile) {
      request.data = "@" + request.stdinFile;
    } else if (request.stdin) {
      request.data = request.stdin;
    }
  }
  const contentTypeHeader = util.getHeader(request, "content-type");
  const isJson =
    contentTypeHeader &&
    contentTypeHeader.split(";")[0].trim() === "application/json";
  if (isJson) {
    try {
      const dataAsJson = JSON.parse(request.data);
      // TODO: we actually want to know how it's serialized by
      // simplejson or Python's builtin json library,
      // which is what Requests uses
      // https://github.com/psf/requests/blob/b0e025ade7ed30ed53ab61f542779af7e024932e/requests/models.py#L473
      // but this is hopefully good enough.
      const roundtrips = JSON.stringify(dataAsJson) === request.data;
      return [dataAsJson, roundtrips];
    } catch {}
  }

  return;
}

type AnsibleURI = {
  url: string;
  method: string;
  body?: string;
  body_format?: string;
  headers?: { [key: string]: string };
  url_username?: string;
  url_password?: string;
  validate_certs?: boolean;
};

export const _toAnsible = (
  requests: Request[],
  warnings: Warnings = [] // eslint-disable-line @typescript-eslint/no-unused-vars
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
  if (request.urls.length > 1) {
    warnings.push([
      "multiple-urls",
      "found " +
        request.urls.length +
        " URLs, only the first one will be used: " +
        request.urls.map((u) => JSON.stringify(u.originalUrl)).join(", "),
    ]);
  }
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

  const r: AnsibleURI = {
    url: request.urls[0].url,
    method: request.urls[0].method, // TODO: toUpper()?
  };
  if (typeof request.data === "string" && request.data) {
    const asJson = getDataString(request);
    if (asJson) {
      r.body = asJson[0];
      r.body_format = "json";
    } else {
      r.body = request.data;
    }
  }
  if (request.headers) {
    r.headers = {};
    for (const h of request.headers) {
      const [k, v] = h;
      r.headers[k] = v || "";
    }
  }
  if (request.urls[0].auth) {
    if (request.urls[0].auth[0]) {
      r.url_username = request.urls[0].auth[0];
    }
    if (request.urls[0].auth[1]) {
      r.url_password = request.urls[0].auth[1];
    }
  }
  if (request.insecure) {
    r.validate_certs = false;
  }
  return yaml.stringify(
    [{ name: request.urls[0].urlWithoutQueryList, uri: r, register: "result" }],
    100,
    2
  );
};
export const toAnsibleWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const requests = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const ansible = _toAnsible(requests, warnings);
  return [ansible, warnings];
};
export const toAnsible = (curlCommand: string | string[]): string => {
  return toAnsibleWarn(curlCommand)[0];
};
