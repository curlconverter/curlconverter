const axios = require('axios');

const response = await axios.post('https://localhost:28139', {
    headers: {
        'A': '\'\'a\'',
        'B': '"',
        'Cookie': 'x=1\'; y=2"',
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
        username: 'ol\'',
        password: 'asd"'
    },
    data: 'a=b&c="&d=\''
});
