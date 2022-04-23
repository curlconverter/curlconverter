httpService = new http();
httpService.setUrl("http://localhost:28139");
httpService.setMethod("POST");
httpService.addParam(type="header", name="Content-Type", value="application/json");
httpService.addParam(type="body", value="{}");

result = httpService.send().getPrefix();
writeDump(result);
