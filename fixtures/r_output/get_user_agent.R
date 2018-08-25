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

#NB. Original query string below. It seems impossible to parse and
#reproduce query strings 100% accurately so the one below is given
#in case the reproduced version is not "correct".
# res <- httr::GET(url = 'http://205.147.98.6/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812', httr::add_headers(.headers=headers))
