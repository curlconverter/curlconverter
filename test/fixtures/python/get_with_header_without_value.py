import requests

headers = {
    'Content-Type': 'text/xml;charset=UTF-8',
    'getWorkOrderCancel': '',
}

response = requests.get('http://localhost:28139/get', headers=headers)
