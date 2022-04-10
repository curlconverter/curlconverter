httpService = new http();
httpService.setUrl("http://localhost:28139");
httpService.setMethod("GET");
httpService.setTimeout(20);

result = httpService.send().getPrefix();
writeDump(result);
