import requests

headers = {
    'Content-type': 'application/sparql-query',
    'Accept': 'application/sparql-results+json',
}

with open('./sample.sparql', 'rb') as f:
    data = f.read().replace(b'\n', b'')

response = requests.post('http://lodstories.isi.edu:3030/american-art/query', headers=headers, data=data)
