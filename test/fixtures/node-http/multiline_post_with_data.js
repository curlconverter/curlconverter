import http from 'http';

const options = {
  hostname: 'localhost:28139',
  path: '/echo/html/',
  headers: {
    'Origin': 'http://fiddle.jshell.net',
    'Content-Type': 'application/x-www-form-urlencoded'
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

req.write(new URLSearchParams({
  'msg1': 'value1',
  'msg2': 'value2'
}).toString());
req.end();
