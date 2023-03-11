import fetch, { FormData } from 'node-fetch';

const form = new FormData();
form.append('d1', 'data1');
form.append('d2', 'data');

fetch('http://localhost:28139/post', {
  method: 'POST',
  body: form
});
