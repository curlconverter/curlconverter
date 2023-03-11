import fetch, { fileFromSync } from 'node-fetch';

fetch('http://localhost:28139/twitter/_mapping/user?pretty', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: fileFromSync('my_file.txt')
});
