library(httr2)

request("http://localhost:28139/") |> 
  req_headers(
    `Accept-Encoding` = "gzip, deflate, sdch",
    `Accept-Language` = "en-US,en;q=0.8",
    `User-Agent` = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
    `Accept` = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    `Referer` = "http://www.wikipedia.org/",
    `Connection` = "keep-alive"
  ) |> 
  req_headers(
    `GeoIP` = "US:Albuquerque:35.1241:-106.7675:v4",
    `uls-previous-languages` = '["en"]',
    `mediaWiki.user.sessionId` = "VaHaeVW3m0ymvx9kacwshZIDkv8zgF9y",
    `centralnotice_buckets_by_campaign` = '{"C14_enUS_dsk_lw_FR":{"val":"0","start":1412172000,"end":1422576000},"C14_en5C_dec_dsk_FR":{"val":3,"start":1417514400,"end":1425290400},"C14_en5C_bkup_dsk_FR":{"val":1,"start":1417428000,"end":1425290400}}',
    `centralnotice_bannercount_fr12` = "22",
    `centralnotice_bannercount_fr12-wait` = "14"
  ) |> 
  req_perform()
