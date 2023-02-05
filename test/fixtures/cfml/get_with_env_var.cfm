httpService = new http();
httpService.setUrl("http://localhost:28139/v2/images?type=distribution");
httpService.setMethod("GET");
httpService.addParam(type="header", name="Content-Type", value="application/json");
httpService.addParam(type="header", name="Authorization", value="Bearer $DO_API_TOKEN");

result = httpService.send().getPrefix();
writeDump(result);
