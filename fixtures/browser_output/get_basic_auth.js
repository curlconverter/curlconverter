fetch('https://api.test.com/', {
    headers: {
        'Authorization': 'Basic ' + btoa('some_username:some_password')
    }
});
