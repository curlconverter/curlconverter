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

response = requests.put('http://localhost:28139/twitter/_mapping/user?pretty', headers=headers, json=json_data)

# Note: json_data will not be serialized by requests
# exactly as it was in the original request.
#data = '{"properties": {"email": {"type": "keyword"}}}'
#response = requests.put('http://localhost:28139/twitter/_mapping/user?pretty', headers=headers, data=data)
