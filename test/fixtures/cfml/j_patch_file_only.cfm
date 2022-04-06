httpService = new http();
httpService.setUrl("http://httpbin.org/patch");
httpService.setCharset("utf-8");
httpService.setMethod("PATCH");
httpService.addParam(type="file" ,name="file1", file="./fixtures/curl_commands/delete.sh");
result = httpService.send().getPrefix();
writeDump(result);
