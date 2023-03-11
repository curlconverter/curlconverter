import got from 'got';

const response = await got.post('http://localhost:28139', {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // body: '{ "drink": "coffe" }',
  json: {
    'drink': 'coffe'
  }
});
