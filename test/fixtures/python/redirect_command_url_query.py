import subprocess
from urllib.parse import quote_plus

import requests

command1 = subprocess.run('echo image.jpg', shell=True, capture_output=True, text=True).stdout

with open(command1) as f:
    params = quote_plus(f.read())

response = requests.get('http://localhost:28139', params=params)
