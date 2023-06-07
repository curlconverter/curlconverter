const form = new FormData();
form.append('from', 'test@tester.com');
form.append('to', 'devs@tester.net');
form.append('subject', 'Hello');
form.append('text', 'Testing the converter!');

let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open(
  'POST',
  'http://localhost:28139/v3',
  true,
  'test',
  ''
);

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send(form);
