let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('GET', 'http://localhost:28139');
xhr.timeout = 20000;

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send();
