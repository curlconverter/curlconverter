%% Web Access using Data Import and Export API
uri = 'http://google.com';
body = '';
response = webwrite(uri, body);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

uri = URI('http://google.com/');
body = FileProvider();
response = RequestMessage('post', [], body).send(uri.EncodedURI);
