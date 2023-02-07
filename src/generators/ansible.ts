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

  if (util.getContentType(request) === "application/json") {
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

export const _toAnsible = (
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
  if (request.cookieFiles) {
    warnings.push([
      "cookie-files",
      "passing a file for --cookie/-b is not supported: " +
        request.cookieFiles.map((c) => JSON.stringify(c)).join(", "),
    ]);
  }

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
  if (request.headers && request.headers.filter((h) => h[0]).length) {
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
