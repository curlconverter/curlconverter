import got from 'got';

const response = await got.post('http://localhost:28139', {
  headers: {
    'A': "''a'",
    'B': '"',
    'Cookie': 'x=1\'; y=2"',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  username: "ol'",
  password: 'asd"',
  body: 'a=b&c="&d=\''
});
