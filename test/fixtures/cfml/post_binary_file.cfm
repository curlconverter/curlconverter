httpService = new http();
httpService.setUrl("http://localhost:28139/american-art/query");
httpService.setMethod("POST");
httpService.addParam(type="header", name="Content-type", value="application/sparql-query");
httpService.addParam(type="header", name="Accept", value="application/sparql-results+json");
httpService.addParam(type="body", value="#fileReadBinary(expandPath("./sample.sparql"))#");

result = httpService.send().getPrefix();
writeDump(result);
