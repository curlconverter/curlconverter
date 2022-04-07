httpService = new http();
httpService.setUrl("google.com");
httpService.setCharset("utf-8");
httpService.setMethod("POST");
httpService.addParam(type="header", name="Content-Type", value="application/x-www-form-urlencoded");
httpService.addParam(type="body", value="field=don%27t%20you%20like%20quotes");
result = httpService.send().getPrefix();
writeDump(result);
