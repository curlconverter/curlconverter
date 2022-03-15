fetch('http://localhost:28139/post', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({"title":"china1"})
});
