import got from 'got';

const response = await got.post('http://localhost:28139/api/oauth/token/', {
  username: 'foo',
  password: 'bar',
  form: {
    'grant_type': 'client_credentials'
  }
});
