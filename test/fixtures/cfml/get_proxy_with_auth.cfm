httpService = new http();
httpService.setUrl("http://localhost:9000");
httpService.setMethod("GET");
httpService.setProxyServer("http://localhost");
httpService.setProxyPort(8080);
httpService.setProxyUser("anonymous");
httpService.setProxyPassword("anonymous");

result = httpService.send().getPrefix();
writeDump(result);
