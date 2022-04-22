import fetch from 'node-fetch';

fetch('localhost:28139', {
    method: 'POST',
    body: new URLSearchParams({
        'field': 'don\'t you like quotes'
    })
});
