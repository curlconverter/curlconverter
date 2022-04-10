%% Web Access using Data Import and Export API
uri = 'http://localhost:28139/';
body = 'foo=''bar''';
options = weboptions('MediaType', 'application/x-www-form-urlencoded');
response = webwrite(uri, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

header = HeaderField('Content-Type', 'application/x-www-form-urlencoded');
uri = URI('http://localhost:28139/');
body = FormProvider('foo', '''bar''');
response = RequestMessage('post', header, body).send(uri.EncodedURI);
