httpService = new http();
httpService.setUrl("http://example.com");
httpService.setMethod("GET");
httpService.setTimeout(20);

result = httpService.send().getPrefix();
writeDump(result);
