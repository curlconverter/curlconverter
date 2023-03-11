const form = new FormData();
form.append('attributes', '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}');
form.append('file', File(['<data goes here>'], 'myfile.jpg'));

fetch('http://localhost:28139/api/2.0/files/content', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ACCESS_TOKEN',
    'X-Nice': 'Header'
  },
  body: form
});
