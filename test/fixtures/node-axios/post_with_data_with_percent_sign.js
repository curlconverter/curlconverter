const axios = require('axios');

const response = await axios.post(
    'https://localhost:28139/post',
    'secret=*%5*!',
    {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
);
