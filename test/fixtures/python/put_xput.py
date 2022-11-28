import requests

headers = {
    # Already added when you pass json=
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
