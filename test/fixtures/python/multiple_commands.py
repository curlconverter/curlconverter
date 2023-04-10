import sys
import requests

response = requests.get('http://localhost:28139')


response = requests.get('http://localhost:28139/second')


data = sys.stdin.buffer.read()

response = requests.put('http://localhost:28139/third', data=data)
