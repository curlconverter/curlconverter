import got from 'got';

const response = await got.put('http://localhost:28139/test/_security', {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  username: 'admin',
  password: '123',
  body: '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'
});
