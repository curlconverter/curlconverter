import http from 'http';
import FormData from 'form-data';

const form = new FormData();
form.append('from', 'test@tester.com');
form.append('to', 'devs@tester.net');
form.append('subject', 'Hello');
form.append('text', 'Testing the converter!');

const options = {
  hostname: 'localhost:28139',
  path: '/v3',
  method: 'POST',
  auth: 'test:',
  headers: form.getHeaders()
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
