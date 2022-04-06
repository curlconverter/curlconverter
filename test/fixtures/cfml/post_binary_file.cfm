httpService = new http();
httpService.setUrl("http://lodstories.isi.edu:3030/american-art/query");
httpService.setCharset("utf-8");
httpService.setMethod("POST");
httpService.addParam(type="header", name="Content-type", value="application/sparql-query");
httpService.addParam(type="header", name="Accept", value="application/sparql-results+json");
httpService.addParam(type="body", value="./sample.sparql");
result = httpService.send().getPrefix();
writeDump(result);
