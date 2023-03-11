import got from 'got';

const response = await got.post('http://localhost:28139/endpoint', {
  headers: {
    'Content-Type': 'application/json',
    'key': 'abcdefg'
  }
});
