import fetch from 'node-fetch';
import * as fs from 'fs';
import execSync from 'node:child_process';

fetch('http://localhost:28139', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new ArrayBuffer('foo&', fs.readFileSync(execSync('echo myfile.jg').stdout, 'utf-8'))
});
