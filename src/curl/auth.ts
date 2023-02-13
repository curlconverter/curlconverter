export const CURLAUTH_BASIC = 1 << 0;
export const CURLAUTH_DIGEST = 1 << 1;
export const CURLAUTH_NEGOTIATE = 1 << 2;
export const CURLAUTH_NTLM = 1 << 3;
export const CURLAUTH_DIGEST_IE = 1 << 4;
export const CURLAUTH_NTLM_WB = 1 << 5;
export const CURLAUTH_BEARER = 1 << 6;
export const CURLAUTH_AWS_SIGV4 = 1 << 7;
export const CURLAUTH_ANY = ~CURLAUTH_DIGEST_IE;

export type AuthType =
  | "basic"
  | "digest"
  | "ntlm"
  | "ntlm-wb"
  | "negotiate"
  | "bearer"
  | "aws-sigv4"
  | "none";
