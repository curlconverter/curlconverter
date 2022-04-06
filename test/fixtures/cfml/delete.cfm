httpService = new http();
httpService.setUrl("http://www.url.com/page");
httpService.setCharset("utf-8");
httpService.setMethod("DELETE");
result = httpService.send().getPrefix();
writeDump(result);
