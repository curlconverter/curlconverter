const data = '';

let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('POST', 'http://localhost:28139');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send(data);
