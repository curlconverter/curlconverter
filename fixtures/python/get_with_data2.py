import requests

headers = {
    'X-Api-Key': '{admin_api_key}',
    'Content-Type': 'application/json',
}

params = [
    ('policy_id', 'policy_id'),
    ('channel_ids', 'channel_id'),
]

response = requests.put('https://api.newrelic.com/v2/alerts_policy_channels.json', headers=headers, params=params)
