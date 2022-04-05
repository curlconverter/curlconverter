httpService = new http();
httpService.setUrl("http://localhost:9000");
httpService.setCharset("utf-8");
httpService.setMethod("GET");
httpService.setProxyServer("http://localhost");
httpService.setProxyPort("8080");
result = httpService.send().getPrefix();
writeDump(result);
