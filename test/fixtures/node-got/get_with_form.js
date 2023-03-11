import got from 'got';

const form = new FormData();
form.append('from', 'test@tester.com');
form.append('to', 'devs@tester.net');
form.append('subject', 'Hello');
form.append('text', 'Testing the converter!');

const response = await got.post('http://localhost:28139/v3', {
  username: 'test',
  body: form
});
