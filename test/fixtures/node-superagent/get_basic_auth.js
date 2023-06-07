import request from 'superagent';

request
  .get('http://localhost:28139/')
  .auth('some_username', 'some_password')
  .then(res => {
     console.log(res.body);
  });
