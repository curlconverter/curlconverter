import fetch, { fileFromSync } from 'node-fetch';

fetch('http://localhost:28139/file.txt', {
  method: 'PUT',
  body: fileFromSync('file.txt')
});
