import fetch from 'node-fetch';
import fs from 'fs';

fetch('http://localhost:28139', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new ArrayBuffer('foo&', fs.readFileSync('start' + process.env['FILENAME'] + 'end', 'utf-8'))
});
