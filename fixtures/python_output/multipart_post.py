import requests

headers = {
    'Authorization': 'Bearer ACCESS_TOKEN',
}

files = {
    'attributes': '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}',
    'file': open('myfile.jpg', 'rb')
}

requests.post('https://upload.box.com/api/2.0/files/content', headers=headers, files=files)