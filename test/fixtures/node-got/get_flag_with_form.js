import got from 'got';

const form = new FormData();
form.append('name', 'value');

const response = await got.post('http://localhost:28139/upload', {
  body: form
});
