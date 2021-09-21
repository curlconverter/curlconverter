import requests

headers = {
    'accept': 'application/json',
    'Content-Type': 'multipart/form-data',
}

files = {
    'files': ('47.htz', open('47.htz', 'rb')),
    'name': (None, '47'),
    'oldMediaId': (None, '47'),
    'updateInLayouts': (None, '1'),
    'deleteOldRevisions': (None, '1'),
}

response = requests.post('http://129.12.19.62/api/library', headers=headers, files=files)
