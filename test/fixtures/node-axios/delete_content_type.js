const axios = require('axios');

const response = await axios.post(
    'localhost:28139',
    {},
    {
        headers: {
            'Content-Type': 'application/json'
        }
    }
);
