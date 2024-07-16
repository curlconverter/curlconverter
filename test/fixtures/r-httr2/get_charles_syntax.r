library(httr2)

request("http://localhost:28139/?format=json&") |>
  req_headers(
    Host = "api.ipify.org",
    Accept = "*/*",
    `User-Agent` = "GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)",
    `Accept-Language` = "en-CN;q=1, zh-Hans-CN;q=0.9"
  ) |>
  req_perform()
