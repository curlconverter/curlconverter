export { toAnsible } from "./generators/ansible.js";
export { toJavaScript } from "./generators/javascript/javascript.js";
// backwards compatibility alias
export { toJavaScript as toBrowser } from "./generators/javascript/javascript.js";
export { toDart } from "./generators/dart.js";
export { toElixir } from "./generators/elixir.js";
export { toGo } from "./generators/go.js";
export { toJava } from "./generators/java.js";
export { toJsonString } from "./generators/json.js";
export { toMATLAB } from "./generators/matlab/matlab.js";
export { toNode } from "./generators/javascript/node-fetch.js";
// backwards compatibility alias
export { toNode as toNodeFetch } from "./generators/javascript/node-fetch.js";
export { toNodeRequest } from "./generators/javascript/node-request.js";
export { toPhp } from "./generators/php/php.js";
export { toPhpRequests } from "./generators/php/php-requests.js";
export { toPython } from "./generators/python.js";
export { toR } from "./generators/r.js";
export { toRust } from "./generators/rust.js";
export { toStrest } from "./generators/strest.js";

export { CCError } from "./util.js";