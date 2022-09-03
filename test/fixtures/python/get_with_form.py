import requests

files = {
    'from': (None, 'test@tester.com'),
    'to': (None, 'devs@tester.net'),
    'subject': (None, 'Hello'),
    'text': (None, 'Testing the converter!'),
}

response = requests.post('http://localhost:28139/v3', files=files, auth=('test', ''))
