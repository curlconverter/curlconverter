import requests

headers = {
    'accept': 'application/json',
    # requests won't add a boundary if this header is set when you pass files=
    # 'Content-Type': 'multipart/form-data',
}

files = {
    'files': open('47.htz', 'rb'),
    'name': (None, '47'),
    'oldMediaId': (None, '47'),
    'updateInLayouts': (None, '1'),
    'deleteOldRevisions': (None, '1'),
}

response = requests.post('http://localhost:28139/api/library', headers=headers, files=files)
