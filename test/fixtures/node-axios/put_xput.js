const axios = require('axios');

const response = await axios.put('http://localhost:28139/twitter/_mapping/user?pretty', {
    headers: {
        'Content-Type': 'application/json'
    },
    // data: '{"properties": {"email": {"type": "keyword"}}}',
    data: JSON.stringify({
        'properties': {
            'email': {
                'type': 'keyword'
            }
        }
    })
});
