import * as fs from 'fs';

const form = new FormData();
form.append('attributes', '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}');
form.append('file', fs.readFileSync('myfile.jpg'), 'myfile.jpg');

let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('POST', 'http://localhost:28139/api/2.0/files/content');
xhr.setRequestHeader('Authorization', 'Bearer ACCESS_TOKEN');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send(form);
