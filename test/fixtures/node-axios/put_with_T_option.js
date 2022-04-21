const axios = require('axios');

const response = await axios.put(
    'http://localhost:28139/twitter/_mapping/user?pretty',
    // '{"properties": {"email": {"type": "keyword"}}}',
    JSON.stringify({
        'properties': {
            'email': {
                'type': 'keyword'
            }
        }
    }),
    {
        headers: {
            'Content-Type': 'application/json'
        }
    }
);
