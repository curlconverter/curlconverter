import requests

headers = {
    'X-Api-Key': '{admin_api_key}',
    'Content-Type': 'application/json',
}

params = (
    ('policy_id', 'policy_id'),
    ('channel_ids', 'channel_id'),
)

response = requests.put('https://api.newrelic.com/v2/alerts_policy_channels.json', headers=headers, params=params)

#NB. Original query string below. It seems impossible to parse and
#reproduce query strings 100% accurately so the one below is given
#in case the reproduced version is not "correct".
# response = requests.put('https://api.newrelic.com/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id', headers=headers)
