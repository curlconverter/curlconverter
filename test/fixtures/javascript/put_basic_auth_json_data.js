fetch('http://localhost:28139/test/_security', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa('admin:123')
    },
    body: JSON.stringify({"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}})
});
