import requests

headers = {
    'X-Api-Key': '123456789',
}

params = (
    ('test', '2'),
    ('limit', '100'),
    ('w', '4'),
)

response = requests.get('https://synthetics.newrelic.com/synthetics/api/v3/monitors', headers=headers, params=params)

#NB. Original query string below. It seems impossible to parse and
#reproduce query strings 100% accurately so the one below is given
#in case the reproduced version is not "correct".
# response = requests.get('https://synthetics.newrelic.com/synthetics/api/v3/monitors?test=2&limit=100&w=4', headers=headers)
