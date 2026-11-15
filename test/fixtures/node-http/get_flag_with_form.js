import http from 'http';
import FormData from 'form-data';

const form = new FormData();
form.append('name', 'value');

const options = {
  hostname: 'localhost:28139',
  path: '/upload',
  method: 'POST',
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
