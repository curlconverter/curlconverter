import fetch from 'node-fetch';

fetch('http://localhost:28139/', {
  headers: {
    'foo': 'bar'
  }
});
