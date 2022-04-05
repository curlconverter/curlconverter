httpService = new http();
httpService.setUrl("https://api.test.com/");
httpService.setCharset("utf-8");
httpService.setMethod("GET");
httpService.addParam(type="header",name="Authorization", value=":some_password");
result = httpService.send().getPrefix();
writeDump(result);
