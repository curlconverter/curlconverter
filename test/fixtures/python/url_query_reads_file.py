import requests

params = {
    'name': open('myfile.jpg').read(),
}

response = requests.get('http://localhost:28139', params=params)
response = requests.get('http://localhost:28139/?prmsare=perurl&secondparam=yesplease', params=params)
response = requests.get('http://localhost:28139?trailingamper=shouldwork&', params=params)
response = requests.get('http://localhost:28139?noequalshouldnt', params=params)
