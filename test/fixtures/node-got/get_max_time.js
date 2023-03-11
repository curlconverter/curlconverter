import got from 'got';

const response = await got('http://localhost:28139', {
    timeout: {
    request: 20000
  }
});
