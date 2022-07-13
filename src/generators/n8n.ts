import * as util from "../util.js";
import type { Request, Warnings } from "../util.js";

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
  "form",
  "form-string",
  "get",
  "header",
  "head",
  "no-head",
  "insecure",
  "no-insecure",
  "user",
]);

type multipartContent = {
  name?: string;
  content?: string;
  contentFile?: string;
  filename?: string;
};

type n8nOutput = {
  authentication?: string;
  genericAuthType?: string;
  requestMethod: string;
  url: string;
  allowUnauthorizedCerts?: boolean;
  options: { [key: string]: string };
  jsonParameters: boolean;
  sendBinaryData?: boolean;
  binaryPropertyName?: string;
  bodyParametersJson?: string;
  headerParametersJson?: string;
  queryParametersJson?: string;
  bodyParametersUi?: { [key: string]: Array<{ [key: string]: string | null }> };
  headerParametersUi?: {
    [key: string]: Array<{ [key: string]: string | null }>;
  };
  queryParametersUi?: {
    [key: string]: Array<{ [key: string]: string | null }>;
  };
};

export const _toN8n = (request: Request, _warnings: Warnings = []): string => {
  const requestJson: n8nOutput = {
    url: (request.queryDict ? request.urlWithoutQuery : request.url).replace(
      /\/$/,
      ""
    ),
    options: {},
    jsonParameters: true,
    requestMethod: request.method.toUpperCase(),
  };

  console.log(JSON.stringify(request, null, 2));

  if (!request.data && !request.isDataBinary && !request.multipartUploads) {
    requestJson.jsonParameters = false;
    if (request.headers) {
      requestJson.headerParametersUi = {
        parameter: request.headers.map((x) => ({ name: x[0], value: x[1] })),
      };
    }
    if (request.query) {
      requestJson.queryParametersUi = {
        parameter: request.query.map((x) => ({ name: x[0], value: x[1] })),
      };
    }
  } else {
    if (request.isDataBinary) {
      console.log("isDataBinary");
      if ((request.data as string).charAt(0) === "@") {
        requestJson.options.bodyContentType = "raw";
        requestJson.sendBinaryData = true;
        requestJson.binaryPropertyName = request.data;
      } else {
        requestJson.bodyParametersJson = request.data;
      }
    } else if (request.multipartUploads) {
      console.log("multipartUploads");
      requestJson.options.bodyContentType = "multipart-form-data";
      requestJson.sendBinaryData = true;
      requestJson.binaryPropertyName = request.multipartUploads
        .filter((x: multipartContent) => x.filename)
        .map(
          (x: multipartContent) =>
            `${x.name}:${x.filename || x.contentFile || x.content}`
        )
        .join(",");
    } else {
      console.log("Other");
      const contentType = util.getContentType(request)?.toLowerCase();
      switch (contentType) {
        case "application/json":
          requestJson.options.bodyContentType = "json";
          break;
        case "application/x-www-form-urlencoded":
          requestJson.options.bodyContentType = "form-urlencoded";
          break;
        case "multipart/form-data":
          requestJson.options.bodyContentType = "multipart-form-data";
          break;
      }
      try {
        requestJson.bodyParametersJson = JSON.stringify(
          JSON.parse(request.data || "}{")
        );
      } catch {
        requestJson.bodyParametersJson = JSON.stringify(
          querystring.parse(request.data || "{}", { sort: false })
        );
      }
    }
    // requestJson.bodyParametersJson = JSON.stringify(querystring.parse(request.data, { sort: false }));
    requestJson.headerParametersJson = JSON.stringify(
      Object.fromEntries(request.headers || [])
    );
    requestJson.queryParametersJson = JSON.stringify(request.queryDict || {});
  }

  if (request.insecure) {
    requestJson.allowUnauthorizedCerts = true;
  }

  if (request.auth) {
    requestJson.authentication = "genericCredentialType";
    requestJson.genericAuthType = "httpBasicAuth";
  }

  let n8nNode: Record<string, unknown> = { nodes: [] };
  if (Object.keys(requestJson).length) {
    n8nNode = {
      connections: {},
      nodes: [
        {
          name: "HTTP Request",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 2,
          parameters: requestJson,
          position: [0, 0],
        },
      ],
    };
  }

  return JSON.stringify(n8nNode, null, 4) + "\n";
};
export const toN8nWarn = (
  curlCommand: string | string[],
  warnings: Warnings = []
): [string, Warnings] => {
  const request = util.parseCurlCommand(curlCommand, supportedArgs, warnings);
  const json = _toN8n(request, warnings);
  return [json, warnings];
};
export const toN8n = (curlCommand: string | string[]): string => {
  return toN8nWarn(curlCommand)[0];
};
