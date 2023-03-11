fetch('http://localhost:28139/twitter/_mapping/user?pretty', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: File(['<data goes here>'], 'my_file.txt')
});
