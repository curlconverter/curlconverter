var fetch = require('node-fetch');

fetch('http://localhost:28139', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});
