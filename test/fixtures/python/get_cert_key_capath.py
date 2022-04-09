import requests

cert = ('/path/to/cert', '/path/to/key')

response = requests.get('https://localhost:28139', cert=cert, verify='/path/to/ca')
