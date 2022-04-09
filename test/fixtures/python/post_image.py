import requests

files = {
    'image': ('image.jpg', open('image.jpg', 'rb')),
}

response = requests.post('http://localhost:28139/targetservice', files=files)
