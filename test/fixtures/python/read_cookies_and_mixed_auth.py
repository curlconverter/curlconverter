from http.cookiejar import MozillaCookieJar
import requests

cookies = MozillaCookieJar('cookies.txt')

headers = {
    'Authorization': 'Bearer AAAAAAAAAAAA',
}

response = requests.get('http://localhost:28139', cookies=cookies, headers=headers)
