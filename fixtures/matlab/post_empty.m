%% Web Access using Data Import and Export API
uri = 'http://localhost:28139';
body = '';
response = webwrite(uri, body);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

uri = URI('http://localhost:28139');
body = FileProvider();
response = RequestMessage('post', [], body).send(uri.EncodedURI);
