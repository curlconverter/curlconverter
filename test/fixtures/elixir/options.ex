response = HTTPoison.options!(
  "http://localhost:28139/api/tunein/queue-and-play",
  [
    {"Pragma", "no-cache"},
    {"Access-Control-Request-Method", "POST"},
    {"Origin", "https://alexa.amazon.de"},
    {"Accept-Encoding", "gzip, deflate, br"},
    {"Accept-Language", "de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4"},
    {"User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"},
    {"Accept", "*/*"},
    {"Cache-Control", "no-cache"},
    {"Referer", "https://alexa.amazon.de/spa/index.html"},
    {"Connection", "keep-alive"},
    {"DNT", "1"},
    {"Access-Control-Request-Headers", "content-type,csrf"}
  ],
  [
    params: [
      {"deviceSerialNumber", "xxx"},
      {"deviceType", "xxx"},
      {"guideId", "s56876"},
      {"contentType", "station"},
      {"callSign", ""},
      {"mediaOwnerCustomerId", "xxx"}
    ]
  ]
)
