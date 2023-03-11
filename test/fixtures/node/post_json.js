import fetch from 'node-fetch';

fetch('http://localhost:28139', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // body: '{ "drink": "coffe" }',
  body: JSON.stringify({
    'drink': 'coffe'
  })
});
