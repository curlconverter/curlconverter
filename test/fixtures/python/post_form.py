import requests

files = {
    'username': (None, 'davidwalsh'),
    'password': (None, 'something'),
}

response = requests.post('http://localhost:28139/post-to-me.php', files=files)
