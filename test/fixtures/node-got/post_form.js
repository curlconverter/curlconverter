import got from 'got';

const form = new FormData();
form.append('username', 'davidwalsh');
form.append('password', 'something');

const response = await got.post('http://localhost:28139/post-to-me.php', {
  body: form
});
