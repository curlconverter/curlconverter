import requests

headers = {
    'Host': 'api.ipify.org',
    'Accept': '*/*',
    'User-Agent': 'GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)',
    'Accept-Language': 'en-CN;q=1, zh-Hans-CN;q=0.9',
}

params = (
    ('format', 'json'),
)

response = requests.get('http://api.ipify.org/', headers=headers, params=params)

#NB. Original query string below. It seems impossible to parse and
#reproduce query strings 100% accurately so the one below is given
#in case the reproduced version is not "correct".
# response = requests.get('http://api.ipify.org/?format=json&', headers=headers)
