import requests

# Warning: this was an HTTP/2 request but requests only supports HTTP/1.1
response = requests.get('http://localhost:28139')
