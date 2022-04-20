const axios = require('axios');

const response = await axios.post('https://localhost:28139', {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    // data: '{ "drink": "coffe" }',
    data: JSON.stringify({
        'drink': 'coffe'
    })
});
