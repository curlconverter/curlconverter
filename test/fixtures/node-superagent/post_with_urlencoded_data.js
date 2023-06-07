import request from 'superagent';

request
  .post('http://localhost:28139/echo/html/')
  .set('Origin', 'http://fiddle.jshell.net')
  .set('Accept-Encoding', 'gzip, deflate')
  .set('Accept-Language', 'en-US,en;q=0.8')
  .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36')
  .set('Accept', '*/*')
  .set('Referer', 'http://fiddle.jshell.net/_display/')
  .set('X-Requested-With', 'XMLHttpRequest')
  .set('Connection', 'keep-alive')
  .type('form')
  .send({
    'msg1': 'wow',
    'msg2': 'such'
  })
  .then(res => {
     console.log(res.body);
  });
