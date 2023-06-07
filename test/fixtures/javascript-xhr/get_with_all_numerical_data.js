const data = '18233982904';

let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('POST', 'http://localhost:28139/CurlToNode');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Accept', 'application/json');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send(data);
