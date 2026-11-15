import requests

files = {
    'name': (None, 'value'),
}

response = requests.post('http://localhost:28139/upload', files=files)
