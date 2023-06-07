let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('wHat', 'http://localhost:28139');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send();
