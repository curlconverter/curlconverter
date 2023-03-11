import fetch, { FormData, fileFromSync } from 'node-fetch';

const form = new FormData();
form.append('image', fileFromSync('image.jpg'));

fetch('http://localhost:28139/targetservice', {
  method: 'POST',
  body: form
});
