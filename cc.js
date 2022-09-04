import * as curlconverter from "./dist/src/index.js";

let toPython = curlconverter.toJavaJsoup(
  'curl -X POST -H \'Content-Type: application/json\' -d \'{"username":"davidwalsh","password":"something"}\' http://domain.tld/login\n'
);

console.log(toPython);
