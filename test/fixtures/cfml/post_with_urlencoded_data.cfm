httpService = new http();
httpService.setUrl("http://localhost:28139/echo/html/");
httpService.setMethod("POST");
httpService.addParam(type="header", name="Origin", value="http://fiddle.jshell.net");
httpService.addParam(type="header", name="Accept-Encoding", value="gzip, deflate");
httpService.addParam(type="header", name="Accept-Language", value="en-US,en;q=0.8");
httpService.addParam(type="header", name="User-Agent", value="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36");
httpService.addParam(type="header", name="Content-Type", value="application/x-www-form-urlencoded; charset=UTF-8");
httpService.addParam(type="header", name="Accept", value="*/*");
httpService.addParam(type="header", name="Referer", value="http://fiddle.jshell.net/_display/");
httpService.addParam(type="header", name="X-Requested-With", value="XMLHttpRequest");
httpService.addParam(type="header", name="Connection", value="keep-alive");
httpService.addParam(type="body", value="msg1=wow&msg2=such");

result = httpService.send().getPrefix();
writeDump(result);
