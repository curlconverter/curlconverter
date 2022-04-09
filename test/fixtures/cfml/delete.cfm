httpService = new http();
httpService.setUrl("http://localhost:28139/page");
httpService.setMethod("DELETE");

result = httpService.send().getPrefix();
writeDump(result);
