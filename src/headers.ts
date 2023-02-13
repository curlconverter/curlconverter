import { Word, eq } from "./word.js";
import type { Request } from "./request.js";

export type Headers = Array<[Word, Word | null]>;

// Gets the first header, matching case-insensitively
export function getHeader(
  request: Request,
  header: string
): Word | null | undefined {
  if (!request.headers) {
    return undefined;
  }
  const lookup = header.toLowerCase();
  for (const [h, v] of request.headers) {
    if (h.toLowerCase().toString() === lookup) {
      return v;
    }
  }
  return undefined;
}

export function getContentType(request: Request): string | null | undefined {
  if (!request.headers) {
    return undefined;
  }
  const contentTypeHeader = getHeader(request, "content-type");
  if (!contentTypeHeader) {
    return contentTypeHeader;
  }
  return contentTypeHeader.split(";")[0].trim().toString();
}

export function _hasHeader(headers: Headers, header: Word | string): boolean {
  const lookup = header.toLowerCase();
  for (const h of headers) {
    if (eq(h[0].toLowerCase(), lookup)) {
      return true;
    }
  }
  return false;
}

export function hasHeader(request: Request, header: Word | string): boolean {
  if (!request.headers) {
    return false;
  }
  return _hasHeader(request.headers, header);
}

export function _setHeaderIfMissing(
  headers: Headers,
  header: Word | string,
  value: Word | string,
  lowercase: boolean | number = false
): boolean {
  if (_hasHeader(headers, header)) {
    return false;
  }

  if (lowercase) {
    header = header.toLowerCase();
  }
  if (typeof header === "string") {
    header = new Word(header);
  }
  if (typeof value === "string") {
    value = new Word(value);
  }
  headers.push([header, value]);
  return true;
}
export function setHeaderIfMissing(
  request: Request,
  header: string,
  value: Word
) {
  if (!request.headers) {
    return;
  }
  return _setHeaderIfMissing(
    request.headers,
    header,
    value,
    request.lowercaseHeaders
  );
}

export function _deleteHeader(headers: Headers, header: string) {
  const lookup = header.toLowerCase();
  for (let i = headers.length - 1; i >= 0; i--) {
    if (headers[i][0].toLowerCase().toString() === lookup) {
      headers.splice(i, 1);
    }
  }
}

export function deleteHeader(request: Request, header: string) {
  if (!request.headers) {
    return;
  }
  return _deleteHeader(request.headers, header);
}

export function countHeader(request: Request, header: string) {
  let count = 0;
  const lookup = header.toLowerCase();
  for (const h of request.headers || []) {
    if (h[0].toLowerCase().toString() === lookup) {
      count += 1;
    }
  }
  return count;
}

// Cookie is a type of header.
export type Cookie = [Word, Word];
export type Cookies = Array<Cookie>;

export function parseCookiesStrict(cookieString: Word): Cookies | null {
  const cookies: Cookies = [];
  for (let cookie of cookieString.split(";")) {
    cookie = cookie.replace(/^ /, "");
    const [name, value] = cookie.split("=", 2);
    if (value === undefined) {
      return null;
    }
    cookies.push([name, value]);
  }
  if (new Set(cookies.map((c) => c[0])).size !== cookies.length) {
    return null;
  }
  return cookies;
}

export function parseCookies(cookieString: Word): Cookies | null {
  const cookies: Cookies = [];
  for (let cookie of cookieString.split(";")) {
    cookie = cookie.trim();
    if (!cookie) {
      continue;
    }
    const [name, value] = cookie.split("=", 2);
    cookies.push([name.trim(), (value || "").trim()]);
  }
  if (new Set(cookies.map((c) => c[0])).size !== cookies.length) {
    return null;
  }
  return cookies;
}
