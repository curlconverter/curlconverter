import http from 'http';

const options = {
  hostname: 'localhost:28139',
  path: '/v2/images?type=distribution',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env['DO_API_TOKEN']
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
