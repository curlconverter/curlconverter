const axios = require('axios');

const response = await axios.post(
    'http://localhost:28139/endpoint',
    '',
    {
        headers: {
            'Content-Type': 'application/json',
            'key': 'abcdefg'
        }
    }
);
