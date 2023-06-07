import request from 'superagent';

request
  .post('http://localhost:28139/api/2.0/files/content')
  .set('Authorization', 'Bearer ACCESS_TOKEN')
  .field('attributes', '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}')
  .attach('file', 'myfile.jpg', 'myfile.jpg')
  .then(res => {
     console.log(res.body);
  });
