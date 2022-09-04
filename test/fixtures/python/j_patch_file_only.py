import requests

files = {
    'file1': open('./test/fixtures/curl_commands/delete.sh', 'rb'),
}

response = requests.patch('http://localhost:28139/patch', files=files)
