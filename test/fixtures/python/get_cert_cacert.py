import requests

cert = '/path/to/the/cert'

response = requests.get('http://localhost:28139/', cert=cert, verify='/path/to/ca-bundle.crt')
