import requests

files = {
    'username': (None, 'davidwalsh'),
    'password': (None, 'something'),
}

requests.post('http://domain.tld/post-to-me.php', files=files)
