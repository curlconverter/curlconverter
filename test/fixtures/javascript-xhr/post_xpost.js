const data = '{"keywords":"php","page":1,"searchMode":1}';

let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('POST', 'http://localhost:28139/api/xxxxxxxxxxxxxxxx');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send(data);
