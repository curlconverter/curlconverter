import requests

proxies = {
    'http': 'socks4://1.1.1.1:8888',
    'https': 'socks4://1.1.1.1:8888',
}

response = requests.get('http://localhost:28139', proxies=proxies)
