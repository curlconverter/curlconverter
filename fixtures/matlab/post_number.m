%% Web Access using Data Import and Export API
uri = 'http://a.com';
body = '123';
options = weboptions('MediaType', 'application/x-www-form-urlencoded');
response = webwrite(uri, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

header = HeaderField('Content-Type', 'application/x-www-form-urlencoded');
uri = URI('http://a.com');
body = JSONProvider(123);
response = RequestMessage('post', header, body).send(uri.EncodedURI);
