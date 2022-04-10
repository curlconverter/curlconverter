import requests

headers = {
    '\'Accept\'': '\'application/json\'',
    'Authorization': 'Bearer 000000000000000-0000',
    'Content-Type': 'application/json',
}

data = '{"server_id": "00000000000",                   "shared_server": {"library_section_ids": 00000000000,                                     "invited_id": 00000000000}                   }'

response = requests.post('http://localhost:28139/api/servers/00000000000/shared_servers/', headers=headers, data=data)
