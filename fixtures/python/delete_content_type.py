import requests

headers = {
    # 'Content-Type': 'application/json',
}

json_data = {}

response = requests.post('http://example.com', headers=headers, json=json_data)
