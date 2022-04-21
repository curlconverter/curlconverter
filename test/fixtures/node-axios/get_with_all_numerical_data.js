const axios = require('axios');

const response = await axios.post(
    'http://localhost:28139/CurlToNode',
    '18233982904',
    {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
);
