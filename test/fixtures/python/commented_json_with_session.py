from http.cookiejar import MozillaCookieJar
import requests

cookies = MozillaCookieJar('cookies.txt')

headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}

json_data = {}

with requests.Session() as session:
    session.cookies = cookies
    response = session.post('http://localhost:28139', headers=headers, json=json_data)
    # Note: json_data will not be serialized by requests
    # exactly as it was in the original request.
    #data = '{   }'
    #response = session.post('http://localhost:28139', headers=headers, data=data)
    cookies.save(ignore_discard=True, ignore_expires=True)
