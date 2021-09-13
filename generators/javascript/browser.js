import { toJsFetch } from "./fetch.js";

export const toBrowser = curlCommand => {
  const browserCode = toJsFetch(curlCommand)

  return browserCode
}
