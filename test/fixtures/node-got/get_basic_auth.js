import got from 'got';

const response = await got('http://localhost:28139/', {
  username: 'some_username',
  password: 'some_password'
});
