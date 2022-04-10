import requests

headers = {
    # Already added when you pass json= but not when you pass data=
    # 'Content-Type': 'application/json',
    'Accept': 'application/json',
}

json_data = {
    'drink': 'coffe',
}

response = requests.post('https://localhost:28139', headers=headers, json=json_data)

# Note: json_data will not be serialized by requests
# exactly as it was in the original request.
#data = '{ "drink": "coffe" }'
#response = requests.post('https://localhost:28139', headers=headers, data=data)
