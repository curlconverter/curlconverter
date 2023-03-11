import fetch from 'node-fetch';

fetch('http://localhost:28139/v2/images?type=distribution', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env['DO_API_TOKEN']
  }
});
