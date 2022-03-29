import requests

headers = {
    'x-msisdn': 'XXXXXXXXXXXXX',
    'user-agent': 'Mozilla Android6.1',
}

params = {
    'p': '5',
    'pub': 'testmovie',
    'tkn': '817263812',
}

response = requests.get('http://205.147.98.6/vc/moviesmagic', headers=headers, params=params)
