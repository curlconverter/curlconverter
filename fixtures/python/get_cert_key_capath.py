import requests

cert = ('/path/to/cert', '/path/to/key')

response = requests.get('https://example.com', cert=cert, verify='/path/to/ca')
