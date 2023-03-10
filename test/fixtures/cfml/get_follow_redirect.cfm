httpService = new http();
httpService.setUrl("http://localhost:28139");
httpService.setMethod("GET");

result = httpService.send().getPrefix();
writeDump(result);
