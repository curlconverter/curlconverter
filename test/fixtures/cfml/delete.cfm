httpService = new http();
httpService.setUrl("http://www.url.com/page");
httpService.setMethod("DELETE");

result = httpService.send().getPrefix();
writeDump(result);
