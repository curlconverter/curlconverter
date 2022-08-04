import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

import yaml from "yamljs";
import querystring from "query-string";

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
  "referer",
  // "form",
  // "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "insecure",
  "no-insecure",
  "user",
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
  request: Request,
  warnings: Warnings = [] // eslint-disable-line @typescript-eslint/no-unused-vars
): string => {
  const r: AnsibleURI = {
    url: request.url,
    method: request.method, // TODO: toUpper()?
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
  if (request.auth) {
    if (request.auth[0]) {
      r.url_username = request.auth[0];
    }
    if (request.auth[1]) {
      r.url_password = request.auth[1];
    }
  }
  if (request.insecure) {
    r.validate_certs = false;
  }
  return yaml.stringify(
    [{ name: request.urlWithoutQuery, uri: r, register: "result" }],
    100,
    2
  );
};
export const toAnsibleWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const ansible = _toAnsible(request, warnings);
  return [ansible, warnings];
};
export const toAnsible = (curlCommand: string | string[]): string => {
  return toAnsibleWarn(curlCommand)[0];
};
