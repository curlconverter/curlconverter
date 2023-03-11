const form = new FormData();
form.append('username', 'davidwalsh');
form.append('password', 'something');

fetch('http://localhost:28139/post-to-me.php', {
  method: 'POST',
  body: form
});
