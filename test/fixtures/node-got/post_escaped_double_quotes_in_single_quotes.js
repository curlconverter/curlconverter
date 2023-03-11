import got from 'got';

const response = await got.post('http://localhost:28139/', {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'foo=\\"bar\\"'
});
