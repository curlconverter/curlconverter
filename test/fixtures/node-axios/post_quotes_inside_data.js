const axios = require('axios');

const response = await axios.post(
    'localhost:28139',
    new URLSearchParams({
        'field': 'don\'t you like quotes'
    })
);
