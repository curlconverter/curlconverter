import requests

params = {
    'foo': 'bar',
    'baz': 'qux',
}
response = requests.get('http://localhost:28139', params=params)

params = {
    'prmsare': 'perurl',
    'secondparam': 'yesplease',
    'foo': 'bar',
    'baz': 'qux',
}
response = requests.get('http://localhost:28139/', params=params)

response = requests.get('http://localhost:28139?trailingamper=shouldwork&&foo=bar&baz=qux')

response = requests.get('http://localhost:28139?noequalshouldnt&foo=bar&baz=qux')
