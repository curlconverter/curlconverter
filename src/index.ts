export { toAnsible, toAnsibleWarn } from "./generators/ansible.ts";
export { toC, toCWarn } from "./generators/c.ts";
export { toCFML, toCFMLWarn } from "./generators/cfml.ts";
export { toClojure, toClojureWarn } from "./generators/clojure.ts";
export { toCSharp, toCSharpWarn } from "./generators/csharp.ts";
export { toDart, toDartWarn } from "./generators/dart.ts";
export { toElixir, toElixirWarn } from "./generators/elixir.ts";
export { toGo, toGoWarn } from "./generators/go.ts";
export { toHarString, toHarStringWarn } from "./generators/har.ts";
export { toHTTP, toHTTPWarn } from "./generators/http.ts";
export { toHttpie, toHttpieWarn } from "./generators/httpie.ts";
export { toJava, toJavaWarn } from "./generators/java/java.ts";
export {
  toJavaHttpUrlConnection,
  toJavaHttpUrlConnectionWarn,
} from "./generators/java/httpurlconnection.ts";
export { toJavaJsoup, toJavaJsoupWarn } from "./generators/java/jsoup.ts";
export { toJavaOkHttp, toJavaOkHttpWarn } from "./generators/java/okhttp.ts";
export {
  toJavaScript,
  toJavaScriptWarn,
} from "./generators/javascript/javascript.ts";
export {
  toJavaScriptJquery,
  toJavaScriptJqueryWarn,
} from "./generators/javascript/jquery.ts";
export {
  toJavaScriptXHR,
  toJavaScriptXHRWarn,
} from "./generators/javascript/xhr.ts";
export {
  toJsonObject,
  toJsonObjectWarn,
  toJsonString,
  toJsonStringWarn,
  type JSONOutput,
} from "./generators/json.ts";
export { toJulia, toJuliaWarn } from "./generators/julia.ts";
export { toKotlin, toKotlinWarn } from "./generators/kotlin.ts";
export { toLua, toLuaWarn } from "./generators/lua.ts";
export { toMATLAB, toMATLABWarn } from "./generators/matlab/matlab.ts";
export { toNode, toNodeWarn } from "./generators/javascript/javascript.ts";
export { toNodeAxios, toNodeAxiosWarn } from "./generators/javascript/axios.ts";
export { toNodeGot, toNodeGotWarn } from "./generators/javascript/got.ts";
export { toNodeHttp, toNodeHttpWarn } from "./generators/javascript/http.ts";
export { toNodeKy, toNodeKyWarn } from "./generators/javascript/ky.ts";
export {
  toNodeSuperAgent,
  toNodeSuperAgentWarn,
} from "./generators/javascript/superagent.ts";
export {
  toNodeRequest,
  toNodeRequestWarn,
} from "./generators/javascript/request.ts";
export { toObjectiveC, toObjectiveCWarn } from "./generators/objectivec.ts";
export { toOCaml, toOCamlWarn } from "./generators/ocaml.ts";
export { toPerl, toPerlWarn } from "./generators/perl.ts";
export { toPhp, toPhpWarn } from "./generators/php/php.ts";
export { toPhpGuzzle, toPhpGuzzleWarn } from "./generators/php/guzzle.ts";
export { toPhpRequests, toPhpRequestsWarn } from "./generators/php/requests.ts";
export {
  toPowershellRestMethod,
  toPowershellRestMethodWarn,
} from "./generators/powershell.ts";
export {
  toPowershellWebRequest,
  toPowershellWebRequestWarn,
} from "./generators/powershell.ts";
export { toPython, toPythonWarn } from "./generators/python/python.ts";
export { toPythonHttp, toPythonHttpWarn } from "./generators/python/http.ts";
export { toR, toRWarn } from "./generators/r/httr.ts";
export { toRHttr2, toRHttr2Warn } from "./generators/r/httr2.ts";
export { toRuby, toRubyWarn } from "./generators/ruby/ruby.ts";
export {
  toRubyHttparty,
  toRubyHttpartyWarn,
} from "./generators/ruby/httparty.ts";
export { toRust, toRustWarn } from "./generators/rust.ts";
export { toSwift, toSwiftWarn } from "./generators/swift.ts";
export { toWget, toWgetWarn } from "./generators/wget.ts";

// backwards compatibility aliases
export { toJavaScript as toBrowser } from "./generators/javascript/javascript.ts";
export { toNode as toNodeFetch } from "./generators/javascript/javascript.ts";
export { toJavaScriptWarn as toBrowserWarn } from "./generators/javascript/javascript.ts";
export { toNodeWarn as toNodeFetchWarn } from "./generators/javascript/javascript.ts";

export { CCError } from "./utils.ts";
export type { Warnings } from "./Warnings.ts";
