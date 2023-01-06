import subprocess
import requests

command1 = subprocess.run('echo myfile.jg', shell=True, capture_output=True, text=True).stdout

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = 'foo'
with open(command1) as f:
    data += '&' + f.read().replace('\n', '').replace('\r', '')

response = requests.post('http://localhost:28139', headers=headers, data=data.encode())
