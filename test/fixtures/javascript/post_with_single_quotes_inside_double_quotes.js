fetch('http://example.com/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'foo=\'bar\''
});
