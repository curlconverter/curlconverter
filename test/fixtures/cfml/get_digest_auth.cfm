httpService = new http();
httpService.setUrl("http://localhost:28139/");
httpService.setMethod("GET");
httpService.addParam(type="header", name="Authorization", value="some_username:some_password");

result = httpService.send().getPrefix();
writeDump(result);