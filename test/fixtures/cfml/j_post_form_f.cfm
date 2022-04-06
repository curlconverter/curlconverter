httpService = new http();
httpService.setUrl("http://httpbin.org/post");
httpService.setCharset("utf-8");
httpService.setMethod("POST");
httpService.addParam(type="formfield", name="d1", value="data1");
httpService.addParam(type="formfield", name="d2", value="data");
result = httpService.send().getPrefix();
writeDump(result);
