import requests

with requests.Session() as session:
    session.max_redirects = 20
    response = session.get('http://localhost:28139')
