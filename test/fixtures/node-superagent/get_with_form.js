import request from 'superagent';

request
  .post('http://localhost:28139/v3')
  .auth('test', '')
  .field('from', 'test@tester.com')
  .field('to', 'devs@tester.net')
  .field('subject', 'Hello')
  .field('text', 'Testing the converter!')
  .then(res => {
     console.log(res.body);
  });
