%% Web Access using Data Import and Export API
uri = 'http://localhost:28139/echo/html/';
body = 'msg1=wow&msg2=such';
options = weboptions(...
    'UserAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',...
    'MediaType', 'application/x-www-form-urlencoded; charset=UTF-8',...
    'HeaderFields', {
        'Origin' 'http://fiddle.jshell.net'
        'Accept-Encoding' 'gzip, deflate'
        'Accept-Language' 'en-US,en;q=0.8'
        'Accept' '*/*'
        'Referer' 'http://fiddle.jshell.net/_display/'
        'X-Requested-With' 'XMLHttpRequest'
        'Connection' 'keep-alive'
    }...
);
response = webwrite(uri, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

header = [
    HeaderField('Origin', 'http://fiddle.jshell.net')
    HeaderField('Accept-Encoding', 'gzip, deflate')
    HeaderField('Accept-Language', 'en-US,en;q=0.8')
    HeaderField('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36')
    HeaderField('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    field.AcceptField(MediaType('*/*'))
    HeaderField('Referer', 'http://fiddle.jshell.net/_display/')
    HeaderField('X-Requested-With', 'XMLHttpRequest')
    HeaderField('Connection', 'keep-alive')
]';
uri = URI('http://localhost:28139/echo/html/');
body = FormProvider('msg1', 'wow', 'msg2', 'such');
response = RequestMessage('post', header, body).send(uri.EncodedURI);
