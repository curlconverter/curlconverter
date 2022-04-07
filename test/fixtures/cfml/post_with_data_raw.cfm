httpService = new http();
httpService.setUrl("http://example.com/post");
httpService.setMethod("POST");
httpService.addParam(type="header", name="Content-Type", value="application/x-www-form-urlencoded");
httpService.addParam(type="body", value="msg1=wow&msg2=such&msg3=@rawmsg");

result = httpService.send().getPrefix();
writeDump(result);
