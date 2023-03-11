import fetch, { FormData } from 'node-fetch';

const form = new FormData();
form.append('from', 'test@tester.com');
form.append('to', 'devs@tester.net');
form.append('subject', 'Hello');
form.append('text', 'Testing the converter!');

fetch('http://localhost:28139/v3', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa('test:')
  },
  body: form
});
