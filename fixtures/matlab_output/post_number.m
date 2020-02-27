%% Web Access using Data Import and Export API
uri = 'http://a.com';
body = '123';
response = webwrite(uri, body);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

uri = URI('http://a.com/');
body = FormProvider('123');
response = RequestMessage('post', [], body).send(uri.EncodedURI);
