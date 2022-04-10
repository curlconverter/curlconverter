httpService = new http();
httpService.setUrl("http://localhost:28139/post");
httpService.setMethod("POST");
httpService.addParam(type="formfield", name="d1", value="data1");
httpService.addParam(type="formfield", name="d2", value="data");

result = httpService.send().getPrefix();
writeDump(result);
