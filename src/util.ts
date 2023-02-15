export class CCError extends Error {}

export const UTF8encoder = new TextEncoder();

// Note: !has() will lead to type errors
// TODO: replace with Object.hasOwn() once Node 16 is EOL'd on 2023-09-11
export function has<T, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function isInt(s: string): boolean {
  return /^\s*[+-]?\d+$/.test(s);
}
