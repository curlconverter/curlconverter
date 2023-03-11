import fetch from 'node-fetch';

fetch('http://localhost:28139/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'key': 'abcdefg'
  }
});
