fetch('https://api.test.com/', {
    headers: {
        'Authorization': 'Basic ' + btoa(':some_password')
    }
});
