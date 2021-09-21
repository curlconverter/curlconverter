%% Web Access using Data Import and Export API
uri = 'http://example.com/';
body = 'foo=bar&foo=&foo=barbar';
response = webwrite(uri, body);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

uri = URI('http://example.com/');
body = FormProvider('foo', 'bar', 'foo', '', 'foo', 'barbar');
response = RequestMessage('post', [], body).send(uri.EncodedURI);
