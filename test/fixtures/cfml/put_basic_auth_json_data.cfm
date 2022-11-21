httpService = new http();
httpService.setUrl("http://localhost:28139/test/_security");
httpService.setMethod("PUT");
httpService.addParam(type="header", name="Content-Type", value="application/x-www-form-urlencoded");
httpService.setUsername("admin");
httpService.setPassword("123");
httpService.addParam(type="body", value='{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}');

result = httpService.send().getPrefix();
writeDump(result);
