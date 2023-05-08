export { toAnsible, toAnsibleWarn } from "./generators/ansible.js";
export { toCFML, toCFMLWarn } from "./generators/cfml.js";
export { toClojure, toClojureWarn } from "./generators/clojure.js";
export {
  toJavaScript,
  toJavaScriptWarn,
} from "./generators/javascript/javascript.js";
export { toNodeAxios, toNodeAxiosWarn } from "./generators/javascript/axios.js";
export { toNodeGot, toNodeGotWarn } from "./generators/javascript/got.js";
export { toCSharp, toCSharpWarn } from "./generators/csharp.js";
export { toDart, toDartWarn } from "./generators/dart.js";
export { toElixir, toElixirWarn } from "./generators/elixir.js";
export { toGo, toGoWarn } from "./generators/go.js";
export { toHarString, toHarStringWarn } from "./generators/har.js";
export { toHTTP, toHTTPWarn } from "./generators/http.js";
export { toHttpie, toHttpieWarn } from "./generators/httpie.js";
export { toJava, toJavaWarn } from "./generators/java/java.js";
export { toJavaOkHttp, toJavaOkHttpWarn } from "./generators/java/okhttp.js";
export { toJsonString, toJsonStringWarn } from "./generators/json.js";
export { toKotlin, toKotlinWarn } from "./generators/kotlin.js";
export { toMATLAB, toMATLABWarn } from "./generators/matlab/matlab.js";
export { toNode, toNodeWarn } from "./generators/javascript/javascript.js";
export {
  toNodeRequest,
  toNodeRequestWarn,
} from "./generators/javascript/request.js";
export { toPhp, toPhpWarn } from "./generators/php/php.js";
export { toPhpGuzzle, toPhpGuzzleWarn } from "./generators/php/guzzle.js";
export { toPhpRequests, toPhpRequestsWarn } from "./generators/php/requests.js";
export { toPython, toPythonWarn } from "./generators/python.js";
export { toR, toRWarn } from "./generators/r.js";
export { toRuby, toRubyWarn } from "./generators/ruby.js";
export { toRust, toRustWarn } from "./generators/rust.js";
export { toWget, toWgetWarn } from "./generators/wget.js";

// backwards compatibility aliases
export { toJavaScript as toBrowser } from "./generators/javascript/javascript.js";
export { toNode as toNodeFetch } from "./generators/javascript/javascript.js";
export { toJavaScriptWarn as toBrowserWarn } from "./generators/javascript/javascript.js";
export { toNodeWarn as toNodeFetchWarn } from "./generators/javascript/javascript.js";

export { CCError } from "./utils.js";
export type { Warnings } from "./Warnings.js";
