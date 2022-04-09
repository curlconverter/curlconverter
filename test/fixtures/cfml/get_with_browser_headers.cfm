httpService = new http();
httpService.setUrl("http://localhost:28139/");
httpService.setMethod("GET");
httpService.addParam(type="cookie", name="GeoIP", value="US:Albuquerque:35.1241:-106.7675:v4");
httpService.addParam(type="cookie", name="uls-previous-languages", value="%5B%22en%22%5D");
httpService.addParam(type="cookie", name="mediaWiki.user.sessionId", value="VaHaeVW3m0ymvx9kacwshZIDkv8zgF9y");
httpService.addParam(type="cookie", name="centralnotice_buckets_by_campaign", value="%7B%22C14_enUS_dsk_lw_FR%22%3A%7B%22val%22%3A%220%22%2C%22start%22%3A1412172000%2C%22end%22%3A1422576000%7D%2C%22C14_en5C_dec_dsk_FR%22%3A%7B%22val%22%3A3%2C%22start%22%3A1417514400%2C%22end%22%3A1425290400%7D%2C%22C14_en5C_bkup_dsk_FR%22%3A%7B%22val%22%3A1%2C%22start%22%3A1417428000%2C%22end%22%3A1425290400%7D%7D");
httpService.addParam(type="cookie", name="centralnotice_bannercount_fr12", value="22");
httpService.addParam(type="cookie", name="centralnotice_bannercount_fr12-wait", value="14");
httpService.addParam(type="header", name="Accept-Encoding", value="gzip, deflate, sdch");
httpService.addParam(type="header", name="Accept-Language", value="en-US,en;q=0.8");
httpService.addParam(type="header", name="User-Agent", value="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36");
httpService.addParam(type="header", name="Accept", value="text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
httpService.addParam(type="header", name="Referer", value="http://www.wikipedia.org/");
httpService.addParam(type="header", name="Connection", value="keep-alive");

result = httpService.send().getPrefix();
writeDump(result);
