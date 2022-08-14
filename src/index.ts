export { toAnsible, toAnsibleWarn } from "./generators/ansible.js";
export { toCFML, toCFMLWarn } from "./generators/cfml.js";
export {
  toJavaScript,
  toJavaScriptWarn,
} from "./generators/javascript/javascript.js";
export { toNodeAxios, toNodeAxiosWarn } from "./generators/javascript/axios.js";
export { toDart, toDartWarn } from "./generators/dart.js";
export { toElixir, toElixirWarn } from "./generators/elixir.js";
export { toGo, toGoWarn } from "./generators/go.js";
export { toJava, toJavaWarn } from "./generators/java.js";
export { toJsonString, toJsonStringWarn } from "./generators/json.js";
export { toMATLAB, toMATLABWarn } from "./generators/matlab/matlab.js";
export { toNode, toNodeWarn } from "./generators/javascript/javascript.js";
export {
  toNodeRequest,
  toNodeRequestWarn,
} from "./generators/javascript/node-request.js";
export { toPhp, toPhpWarn } from "./generators/php/php.js";
export {
  toPhpRequests,
  toPhpRequestsWarn,
} from "./generators/php/php-requests.js";
export { toPython, toPythonWarn } from "./generators/python.js";
export { toR, toRWarn } from "./generators/r.js";
export { toRuby, toRubyWarn } from "./generators/ruby.js";
export { toRust, toRustWarn } from "./generators/rust.js";
export { toStrest, toStrestWarn } from "./generators/strest.js";

// backwards compatibility aliases
export { toJavaScript as toBrowser } from "./generators/javascript/javascript.js";
export { toNode as toNodeFetch } from "./generators/javascript/javascript.js";
export { toJavaScriptWarn as toBrowserWarn } from "./generators/javascript/javascript.js";
export { toNodeWarn as toNodeFetchWarn } from "./generators/javascript/javascript.js";

export { CCError } from "./util.js";
