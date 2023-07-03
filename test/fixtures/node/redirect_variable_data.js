import fetch from 'node-fetch';
import * as fs from 'fs';

fetch('http://localhost:28139', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new ArrayBuffer('foo&', fs.readFileSync(process.env['FILENAME'], 'utf-8'))
});
