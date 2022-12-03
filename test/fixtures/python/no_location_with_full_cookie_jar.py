from http.cookiejar import MozillaCookieJar
import requests

cookies = MozillaCookieJar('cookies.txt')

with requests.Session() as session:
    session.cookies = cookies
    response = session.get('http://localhost:28139', allow_redirects=False)
    cookies.save(ignore_discard=True, ignore_expires=True)
