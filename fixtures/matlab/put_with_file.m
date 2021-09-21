%% Web Access using Data Import and Export API
uri = 'http://awesomeurl.com/upload';
body = fileread('new_file');
body(body==13 | body==10) = [];
options = weboptions('RequestMethod', 'put');
response = webwrite(uri, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

uri = URI('http://awesomeurl.com/upload');
body = fileread('new_file');
body(body==13 | body==10) = [];
response = RequestMessage('put', [], body).send(uri.EncodedURI);
