import requests

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
}

data = 'msg1=wow&msg2=such&msg3=@rawmsg'

response = requests.post('http://localhost:28139/post', headers=headers, data=data)
