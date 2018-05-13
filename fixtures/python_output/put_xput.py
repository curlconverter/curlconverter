import requests

headers = {
    'Content-Type': 'application/json',
}

params = (
    ('pretty', ''),
)

data = '{"properties": {"email": {"type": "keyword"}}}'

response = requests.put('http://localhost:9200/twitter/_mapping/user', headers=headers, params=params, data=data)

#NB. Original query string below. It seems impossible to parse and
#reproduce query strings 100% accurately so the one below is given
#in case the reproduced version is not "correct".
# response = requests.put('http://localhost:9200/twitter/_mapping/user?pretty', headers=headers, data=data)
