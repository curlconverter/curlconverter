fetch('http://localhost:28139/file.txt', {
  method: 'PUT',
  body: File(['<data goes here>'], 'file.txt')
});
