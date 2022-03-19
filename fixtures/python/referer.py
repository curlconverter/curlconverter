import requests

headers = {
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'SimCity',
    'Referer': 'https://website.com',
}

response = requests.get('https://website.com/api', headers=headers)
