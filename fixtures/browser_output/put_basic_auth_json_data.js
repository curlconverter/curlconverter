fetch('http://localhost:5984/test/_security', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Basic ' + btoa('admin:123')
    },
    body: JSON.stringify({"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}})
});
