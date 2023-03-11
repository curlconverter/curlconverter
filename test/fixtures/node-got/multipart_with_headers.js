import got from 'got';
import * as fs from 'fs';

const form = new FormData();
form.append('attributes', '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}');
form.append('file', fs.readFileSync('myfile.jpg'), 'myfile.jpg');

const response = await got.post('http://localhost:28139/api/2.0/files/content', {
  headers: {
    'Authorization': 'Bearer ACCESS_TOKEN',
    'X-Nice': 'Header'
  },
  body: form
});
