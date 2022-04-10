httpService = new http();
httpService.setUrl("http://localhost:28139/?format=json&");
httpService.setMethod("GET");
httpService.addParam(type="header", name="Host", value="api.ipify.org");
httpService.addParam(type="header", name="Accept", value="*/*");
httpService.addParam(type="header", name="User-Agent", value="GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)");
httpService.addParam(type="header", name="Accept-Language", value="en-CN;q=1, zh-Hans-CN;q=0.9");

result = httpService.send().getPrefix();
writeDump(result);
