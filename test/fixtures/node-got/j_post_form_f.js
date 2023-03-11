import got from 'got';

const form = new FormData();
form.append('d1', 'data1');
form.append('d2', 'data');

const response = await got.post('http://localhost:28139/post', {
  body: form
});
