import http

import requests

cookies = http.cookiejar.MozillaCookieJar('cookie.txt')

response = requests.get('http://localhost:28139/', cookies=cookies)
