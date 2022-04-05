httpService = new http();
httpService.setUrl("http://example.net");
httpService.setCharset("utf-8");
httpService.setMethod("GET");
result = httpService.send().getPrefix();
writeDump(result);
