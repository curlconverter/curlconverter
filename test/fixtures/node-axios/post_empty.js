const axios = require('axios');

const response = await axios.post(
    'http://localhost:28139',
    '',
    {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
);
