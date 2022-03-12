import requests

headers = {
    'Content-Type': 'application/json',
}

params = [
    ('pretty', ''),
]

json_data = {
    'properties': {
        'email': {
            'type': 'keyword',
        },
    },
}

response = requests.put('http://localhost:9200/twitter/_mapping/user', headers=headers, params=params, json=json_data)

# Note: original query string below. It seems impossible to parse and
# reproduce query strings 100% accurately so the one below is given
# in case the reproduced version is not "correct".
#
# The data is also posted as JSON, which might not be serialized
# exactly as it appears in the original command. So the original
# data is also given.
#data = '{"properties": {"email": {"type": "keyword"}}}'
#response = requests.put('http://localhost:9200/twitter/_mapping/user?pretty', headers=headers, data=data)
