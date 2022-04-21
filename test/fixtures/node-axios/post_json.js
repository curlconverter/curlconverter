const axios = require('axios');

const response = await axios.post(
    'https://localhost:28139',
    // '{ "drink": "coffe" }',
    {
        'drink': 'coffe'
    },
    {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
);
