import got from 'got';
import * as fs from 'fs';

const form = new FormData();
form.append('image', fs.readFileSync('image.jpg'), 'image.jpg');

const response = await got.post('http://localhost:28139/targetservice', {
  body: form
});
