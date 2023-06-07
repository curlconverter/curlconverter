import http from 'http';

const options = {
  hostname: 'localhost:28139',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'SimCity',
    'Referer': 'https://website.com'
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
