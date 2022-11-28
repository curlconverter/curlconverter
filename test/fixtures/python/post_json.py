import requests

headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}

json_data = {
    'drink': 'coffe',
}

response = requests.post('http://localhost:28139', headers=headers, json=json_data)

# Note: json_data will not be serialized by requests
# exactly as it was in the original request.
#data = '{ "drink": "coffe" }'
#response = requests.post('http://localhost:28139', headers=headers, data=data)
