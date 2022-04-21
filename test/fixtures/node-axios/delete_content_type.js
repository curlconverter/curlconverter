const axios = require('axios');

const response = await axios.post(
    'localhost:28139',
    JSON.stringify({}),
    {
        headers: {
            'Content-Type': 'application/json'
        }
    }
);
