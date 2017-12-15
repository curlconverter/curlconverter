import requests

params = (
    ('page', '1'),
    ('available', ['', '1']),
    ('location', '0'),
    ('city[id]', '0'),
    ('city[locality]', ''),
    ('city[locality_text]', ''),
    ('city[administrative_area_level_2]', ''),
    ('city[administrative_area_level_2_text]', ''),
    ('city[administrative_area_level_1]', ''),
    ('city[administrative_area_level_1_text]', ''),
    ('city[country]', ''),
    ('city[country_text]', ''),
    ('city[latitude]', ''),
    ('city[longitude]', ''),
    ('city[zoom]', ''),
    ('city[name]', ''),
    ('region[id]', '0'),
    ('region[locality]', ''),
    ('region[locality_text]', ''),
    ('region[administrative_area_level_2]', ''),
    ('region[administrative_area_level_2_text]', ''),
    ('region[administrative_area_level_1]', ''),
    ('region[administrative_area_level_1_text]', ''),
    ('region[country]', ''),
    ('region[country_text]', ''),
    ('region[latitude]', ''),
    ('region[longitude]', ''),
    ('region[zoom]', ''),
    ('region[name]', ''),
    ('country', ''),
    ('environment', ''),
    ('population', ''),
    ('period', '0'),
    ('date', '2017-03-03'),
    ('datestart', '2017-03-03'),
    ('dateend', '2017-06-24'),
    ('season', ''),
    ('duration', ''),
    ('isfd', ''),
    ('stopover', ''),
)

response = requests.get('https://www.nomador.com/house-sitting/', params=params)

#NB. Original query string below. It seems impossible to parse and
#reproduce query strings 100% accurately so the one below is given
#in case the reproduced version is not "correct".
# response = requests.get('https://www.nomador.com/house-sitting/?page=1&available=&available=1&location=0&city%5Bid%5D=0&city%5Blocality%5D=&city%5Blocality_text%5D=&city%5Badministrative_area_level_2%5D=&city%5Badministrative_area_level_2_text%5D=&city%5Badministrative_area_level_1%5D=&city%5Badministrative_area_level_1_text%5D=&city%5Bcountry%5D=&city%5Bcountry_text%5D=&city%5Blatitude%5D=&city%5Blongitude%5D=&city%5Bzoom%5D=&city%5Bname%5D=&region%5Bid%5D=0&region%5Blocality%5D=&region%5Blocality_text%5D=&region%5Badministrative_area_level_2%5D=&region%5Badministrative_area_level_2_text%5D=&region%5Badministrative_area_level_1%5D=&region%5Badministrative_area_level_1_text%5D=&region%5Bcountry%5D=&region%5Bcountry_text%5D=&region%5Blatitude%5D=&region%5Blongitude%5D=&region%5Bzoom%5D=&region%5Bname%5D=&country=&environment=&population=&period=0&date=2017-03-03&datestart=2017-03-03&dateend=2017-06-24&season=&duration=&isfd=&stopover=')
