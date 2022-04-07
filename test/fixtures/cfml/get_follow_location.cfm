httpService = new http();
httpService.setUrl("http://example.net");
httpService.setMethod("GET");

result = httpService.send().getPrefix();
writeDump(result);
