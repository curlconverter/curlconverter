import ky from 'ky';

const form = new FormData();
form.append('name', 'value');

ky.post('http://localhost:28139/upload', {
  body: form
});
