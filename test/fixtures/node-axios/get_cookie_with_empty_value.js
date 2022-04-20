const axios = require('axios');

const response = await axios.get('https://localhost:28139/cookies', {
    headers: {
        'accept': 'application/json',
        'Cookie': 'mysamplecookie=someValue; emptycookie=; otherCookie=2'
    }
});
