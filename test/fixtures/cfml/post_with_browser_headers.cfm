httpService = new http();
httpService.setUrl("http://localhost:28139/ajax/demo_post.asp");
httpService.setMethod("POST");
httpService.addParam(type="cookie", name="_gat", value="1");
httpService.addParam(type="cookie", name="ASPSESSIONIDACCRDTDC", value="MCMDKFMBLLLHGKCGNMKNGPKI");
httpService.addParam(type="cookie", name="_ga", value="GA1.2.1424920226.1419478126");
httpService.addParam(type="header", name="Origin", value="http://www.w3schools.com");
httpService.addParam(type="header", name="Accept-Encoding", value="gzip, deflate");
httpService.addParam(type="header", name="Accept-Language", value="en-US,en;q=0.8");
httpService.addParam(type="header", name="User-Agent", value="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36");
httpService.addParam(type="header", name="Accept", value="*/*");
httpService.addParam(type="header", name="Referer", value="http://www.w3schools.com/ajax/tryit_view.asp?x=0.07944501144811511");
httpService.addParam(type="header", name="Connection", value="keep-alive");
httpService.addParam(type="header", name="Content-Length", value="0");

result = httpService.send().getPrefix();
writeDump(result);
