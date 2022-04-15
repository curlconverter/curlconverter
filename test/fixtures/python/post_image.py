import requests

files = {
    'image': open('image.jpg', 'rb'),
}

response = requests.post('http://localhost:28139/targetservice', files=files)
