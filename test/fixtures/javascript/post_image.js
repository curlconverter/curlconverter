const form = new FormData();
form.append('image', File(['<data goes here>'], 'image.jpg'));

fetch('http://localhost:28139/targetservice', {
  method: 'POST',
  body: form
});
