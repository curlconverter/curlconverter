let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('PUT', 'http://localhost:28139/file.txt');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send();
