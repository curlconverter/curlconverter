let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('GET', 'http://localhost:28139?key=one&key=two');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send();
