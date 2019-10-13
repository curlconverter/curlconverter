import requests

headers = {
    'x-msisdn': 'XXXXXXXXXXXXX',
    'User-Agent': 'Mozilla Android6.1',
}

params = (
    ('p', '5'),
    ('pub', 'testmovie'),
    ('tkn', '817263812'),
)

response = requests.get('http://205.147.98.6/vc/moviesmagic', headers=headers, params=params)

#NB. Original query string below. It seems impossible to parse and
#reproduce query strings 100% accurately so the one below is given
#in case the reproduced version is not "correct".
# response = requests.get('http://205.147.98.6/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812', headers=headers)
