import requests

headers = {
    'X-Api-Key': '123456789',
}

params = {
    'test': '2',
    'limit': '100',
    'w': '4',
}

response = requests.get('https://synthetics.newrelic.com/synthetics/api/v3/monitors', headers=headers, params=params)
