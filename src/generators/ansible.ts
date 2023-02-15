import { parseCurlCommand, getFirst, COMMON_SUPPORTED_ARGS } from "../parse.js";
import type { Request, Warnings } from "../parse.js";

import yaml from "yamljs";

const supportedArgs = new Set([
  ...COMMON_SUPPORTED_ARGS,
  "insecure",
  "no-insecure",
  // "form",
  // "form-string",
]);

function getDataString(request: Request): [string, boolean] | undefined {
  if (!request.data) {
    return;
  }

  if (request.headers.getContentType() === "application/json") {
    // TODO: warn if contains variables
    const dataStr = request.data.toString();
    try {
      const dataAsJson = JSON.parse(dataStr);
      // TODO: we actually want to know how it's serialized by
      // Ansible, but this is hopefully good enough.
      const roundtrips = JSON.stringify(dataAsJson) === dataStr;
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

export function _toAnsible(
  requests: Request[],
  warnings: Warnings = []
): string {
  const request = getFirst(requests, warnings);

  const r: AnsibleURI = {
    url: request.urls[0].url.toString(),
    method: request.urls[0].method.toString(), // TODO: toUpper()?
  };
  if (request.data) {
    const asJson = getDataString(request);
    if (asJson) {
      r.body = asJson[0];
      r.body_format = "json";
    } else {
      r.body = request.data.toString();
    }
  }
  if (request.headers.length) {
    r.headers = {};
    for (const h of request.headers) {
      const [k, v] = h;
      if (v !== null) {
        r.headers[k.toString()] = v.toString();
      }
    }
  }
  if (request.urls[0].auth) {
    if (request.urls[0].auth[0].toBool()) {
      r.url_username = request.urls[0].auth[0].toString();
    }
    if (request.urls[0].auth[1].toBool()) {
      r.url_password = request.urls[0].auth[1].toString();
    }
  }
  if (request.insecure) {
    r.validate_certs = false;
  }
  return yaml.stringify(
    [
      {
        name: request.urls[0].urlWithoutQueryList.toString(),
        uri: r,
        register: "result",
      },
    ],
    100,
    2
  );
}
export function toAnsibleWarn(
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] {
  const requests = parseCurlCommand(curlCommand, supportedArgs, warnings);
  const ansible = _toAnsible(requests, warnings);
  return [ansible, warnings];
}
export function toAnsible(curlCommand: string | string[]): string {
  return toAnsibleWarn(curlCommand)[0];
}
