require(httr)

headers = c(
  `x-msisdn` = 'XXXXXXXXXXXXX',
  `User-Agent` = 'Mozilla Android6.1'
)

params = list(
  `p` = '5',
  `pub` = 'testmovie',
  `tkn` = '817263812'
)

res <- httr::GET(url = 'http://205.147.98.6/vc/moviesmagic', httr::add_headers(.headers=headers), query = params)
