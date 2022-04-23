import os

import requests

DO_API_TOKEN = os.getenv('DO_API_TOKEN')

headers = {
    'Content-Type': 'application/json',
    'Authorization': f"Bearer {DO_API_TOKEN}",
}

params = {
    'type': 'distribution',
}

response = requests.get('http://localhost:28139/v2/images', params=params, headers=headers)
