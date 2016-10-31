import requests

headers = {
    'Content-type': 'application/sparql-query',
    'Accept': 'application/sparql-results+json',
}

data = open('./sample.sparql', 'rb').read()
requests.post('http://lodstories.isi.edu:3030/american-art/query', headers=headers, data=data)