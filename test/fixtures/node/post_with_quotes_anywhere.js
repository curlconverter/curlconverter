import fetch from 'node-fetch';

fetch('https://localhost:28139', {
    method: 'POST',
    headers: {
        'A': '\'\'a\'',
        'B': '"',
        'Cookie': 'x=1\'; y=2"',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa('ol\':asd"')
    },
    body: 'a=b&c="&d=\''
});
