library(httr)

cookies = c(
  secure_user_id = "InNlY3VyZTEwNjI3Ig==--3b5df49345735791f2b80eddafb630cdcba76a1d",
  adaptive_image = "1440",
  has_js = "1",
  ccShowCookieIcon = "no",
  `_web_session` = "Y2h...e5"
)

res <- httr::GET(url = "http://localhost:28139/page", httr::set_cookies(.cookies = cookies))
