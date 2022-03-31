%% Web Access using Data Import and Export API
uri = 'http://example.com/';
body = 'foo=bar&foo=&foo=barbar';
options = weboptions('MediaType', 'application/x-www-form-urlencoded');
response = webwrite(uri, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

header = HeaderField('Content-Type', 'application/x-www-form-urlencoded');
uri = URI('http://example.com/');
body = FormProvider('foo', 'bar', 'foo', '', 'foo', 'barbar');
response = RequestMessage('post', header, body).send(uri.EncodedURI);
