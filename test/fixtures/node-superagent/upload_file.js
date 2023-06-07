import request from 'superagent';

request
  .put('http://localhost:28139/file.txt')
  .then(res => {
     console.log(res.body);
  });
