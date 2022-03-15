import requests

headers = {
    # Already added when you pass json= but not when you pass data=
    # 'Content-Type': 'application/json',
}

json_data = {
    'properties': {
        'email': {
            'type': 'keyword',
        },
    },
}

response = requests.put('http://localhost:9200/twitter/_mapping/user?pretty', headers=headers, json=json_data)

# Note: the data is posted as JSON, which might not be serialized
# by Requests exactly as it appears in the original command. So
# the original data is also given.
#data = '{"properties": {"email": {"type": "keyword"}}}'
#response = requests.put('http://localhost:9200/twitter/_mapping/user?pretty', headers=headers, data=data)
