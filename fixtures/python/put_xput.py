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

# Note: the data is posted as JSON, which might not be serialized
# by Requests exactly as it appears in the original command. So
# the original data is also given.
#data = '{"properties": {"email": {"type": "keyword"}}}'
#response = requests.put('http://localhost:9200/twitter/_mapping/user', headers=headers, params=params, data=data)
