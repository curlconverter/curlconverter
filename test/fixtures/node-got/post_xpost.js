import got from 'got';

const response = await got.post('http://localhost:28139/api/xxxxxxxxxxxxxxxx', {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: '{"keywords":"php","page":1,"searchMode":1}'
});
