import request from 'superagent';

request
  .get('http://localhost:28139')
  .set('X-Requested-With', 'XMLHttpRequest')
  .set('User-Agent', 'SimCity')
  .set('Referer', 'https://website.com')
  .then(res => {
     console.log(res.body);
  });
