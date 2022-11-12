import requests

headers = {
    'Content-type': 'application/sparql-query',
    'Accept': 'application/sparql-results+json',
}

with open('./sample.sparql', 'rb') as f:
    data = f.read()

response = requests.post('http://localhost:28139/american-art/query', headers=headers, data=data)
