import got from 'got';

const response = await got.post('http://localhost:28139/post', {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: '{"title":"china1"}'
});
