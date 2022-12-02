from http.cookiejar import MozillaCookieJar
import requests

cookies = MozillaCookieJar('cookie.txt')

response = requests.get('http://localhost:28139/', cookies=cookies)
