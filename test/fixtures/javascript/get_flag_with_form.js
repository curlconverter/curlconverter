const form = new FormData();
form.append('name', 'value');

fetch('http://localhost:28139/upload', {
  method: 'POST',
  body: form
});
