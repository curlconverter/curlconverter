import request from 'superagent';
import { fs } from 'fs';

request
  .get('http://localhost:28139/')
  .cert(fs.readFileSync('/path/to/the/cert'))
  .ca(fs.readFileSync('/path/to/ca-bundle.crt'))
  .then(res => {
     console.log(res.body);
  });
