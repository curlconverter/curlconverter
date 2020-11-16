import os
import requests

DO_API_TOKEN = os.getenv('DO_API_TOKEN')

headers = {
    'Content-Type': 'application/json',
    'Authorization': f"Bearer {DO_API_TOKEN}",
}

params = (
    ('type', 'distribution'),
)

response = requests.get('https://api.digitalocean.com/v2/images', headers=headers, params=params)

#NB. Original query string below. It seems impossible to parse and
#reproduce query strings 100% accurately so the one below is given
#in case the reproduced version is not "correct".
# response = requests.get('https://api.digitalocean.com/v2/images?type=distribution', headers=headers)
