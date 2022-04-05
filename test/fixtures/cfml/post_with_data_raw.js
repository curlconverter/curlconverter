httpService = new http();
httpService.setUrl("http://example.com/post");
httpService.setCharset("utf-8");
httpService.setMethod("POST");
httpService.addParam(type="body", value="msg1=wow&msg2=such&msg3=@rawmsg");
result = httpService.send().getPrefix();
writeDump(result);
