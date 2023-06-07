const data = new URLSearchParams({
  'msg1': 'wow',
  'msg2': 'such'
});

let xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('POST', 'http://localhost:28139/echo/html/');
xhr.setRequestHeader('Origin', 'http://fiddle.jshell.net');
xhr.setRequestHeader('Accept-Encoding', 'gzip, deflate');
xhr.setRequestHeader('Accept-Language', 'en-US,en;q=0.8');
xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36');
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
xhr.setRequestHeader('Accept', '*/*');
xhr.setRequestHeader('Referer', 'http://fiddle.jshell.net/_display/');
xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
xhr.setRequestHeader('Connection', 'keep-alive');

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send(data);
