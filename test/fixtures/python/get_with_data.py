import requests

headers = {
    'X-Api-Key': '123456789',
}

params = {
    'test': '2',
    'limit': '100',
    'w': '4',
}

response = requests.get('http://localhost:28139/synthetics/api/v3/monitors', params=params, headers=headers)
