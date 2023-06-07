import http from 'http';

const options = {
  hostname: 'localhost:28139',
  path: '/synthetics/api/v3/monitors?test=2&limit=100&w=4',
  headers: {
    'X-Api-Key': '123456789'
  }
};

const req = http.get(options, function (res) {
  const chunks = [];

  res.on('data', function (chunk) {
    chunks.push(chunk);
  });

  res.on('end', function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});
