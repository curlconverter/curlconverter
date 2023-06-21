import * as fs from 'fs';

const form = new FormData();
form.append('attributes', '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}');
form.append('file', fs.readFileSync('myfile.jpg'), 'myfile.jpg');

$.ajax({
  url: 'http://localhost:28139/api/2.0/files/content',
  crossDomain: true,
  method: 'post',
  headers: {
    'Authorization': 'Bearer ACCESS_TOKEN'
  },
  data: form
}).done(function(response) {
  console.log(response);
});
