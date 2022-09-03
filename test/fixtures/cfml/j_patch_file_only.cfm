httpService = new http();
httpService.setUrl("http://localhost:28139/patch");
httpService.setMethod("PATCH");
httpService.addParam(type="file", name="file1", file="#expandPath("./test/fixtures/curl_commands/delete.sh")#");

result = httpService.send().getPrefix();
writeDump(result);
