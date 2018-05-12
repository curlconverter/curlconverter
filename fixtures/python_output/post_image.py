import requests

files = {
    'image': ('image.jpg', open('image.jpg', 'rb')),
}

response = requests.post('http://example.com/targetservice', files=files)
