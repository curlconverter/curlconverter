import os
import requests

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + os.getenv('DO_API_TOKEN', ''),
}

params = {
    'type': 'distribution',
}

response = requests.get('http://localhost:28139/v2/images', params=params, headers=headers)
