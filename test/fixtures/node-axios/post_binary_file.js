const axios = require('axios');

const response = await axios.post('http://localhost:28139/american-art/query', {
    headers: {
        'Content-type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json'
    },
    data: '@./sample.sparql'
});
