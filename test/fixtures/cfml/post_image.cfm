httpService = new http();
httpService.setUrl("http://localhost:28139/targetservice");
httpService.setMethod("POST");
httpService.addParam(type="file", name="image", file="#expandPath("image.jpg")#");

result = httpService.send().getPrefix();
writeDump(result);
