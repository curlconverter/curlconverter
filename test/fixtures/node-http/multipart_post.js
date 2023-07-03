import http from 'http';
import FormData from 'form-data';
import * as fs from 'fs';

const form = new FormData();
form.append('attributes', '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}');
form.append('file', fs.readFileSync('myfile.jpg'), 'myfile.jpg');

const options = {
  hostname: 'localhost:28139',
  path: '/api/2.0/files/content',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ACCESS_TOKEN',
    ...form.getHeaders()
  }
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on('data', function (chunk) {
    chunks.push(chunk);
  });

  res.on('end', function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

form.pipe(req);
