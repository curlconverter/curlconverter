const form = new FormData();
form.append('from', 'test@tester.com');
form.append('to', 'devs@tester.net');
form.append('subject', 'Hello');
form.append('text', 'Testing the converter!');

$.ajax({
  url: 'http://localhost:28139/v3',
  crossDomain: true,
  method: 'post',
  username: 'test',
  password: '',
  data: form
}).done(function(response) {
  console.log(response);
});
