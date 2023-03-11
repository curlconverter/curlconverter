import fetch from 'node-fetch';

fetch('http://localhost:28139/api/oauth/token/', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa('foo:bar')
  },
  body: new URLSearchParams({
    'grant_type': 'client_credentials'
  })
});
