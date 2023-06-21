import fetch, { fileFromSync } from 'node-fetch';

fetch('http://localhost:28139/file.txt', {
  method: 'PUT',
  body: fileFromSync('file.txt')
});
fetch('http://localhost:28139/myfile.jpg?params=perurltoo', {
  method: 'PUT',
  body: fileFromSync('myfile.jpg')
});
fetch('http://localhost:28139', {
  method: 'POST',
  body: new URLSearchParams({
    'fooo': 'blah'
  })
});

fetch('http://localhost:28139', {
  method: 'POST',
  body: new URLSearchParams({
    'different': 'data',
    'time': 'now'
  })
});
