httpService = new http();
httpService.setUrl("http://example.com/targetservice");
httpService.setCharset("utf-8");
httpService.setMethod("POST");
httpService.addParam(type="file" ,name="image", file="image.jpg");
result = httpService.send().getPrefix();
writeDump(result);
