const axios = require('axios');

const response = await axios.post(
    'http://localhost:28139/',
    'foo=bar&foo=&foo=barbar',
    {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
);
