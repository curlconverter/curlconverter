import requests

cert = '/path/to/the/cert'

response = requests.get('https://example.com/', cert=cert, verify='/path/to/ca-bundle.crt')
