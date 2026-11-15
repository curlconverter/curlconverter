httpService = new http();
httpService.setUrl("http://localhost:28139/upload");
httpService.setMethod("POST");
httpService.addParam(type="formfield", name="name", value="value");

result = httpService.send().getPrefix();
writeDump(result);
