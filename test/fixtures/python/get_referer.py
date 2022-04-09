import requests

headers = {
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'SimCity',
    'Referer': 'https://website.com',
}

response = requests.get('http://localhost:28139', headers=headers)
