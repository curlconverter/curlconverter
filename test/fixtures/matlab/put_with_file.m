%% Web Access using Data Import and Export API
uri = 'http://localhost:28139/upload';
body = fileread('new_file');
body(body==13 | body==10) = [];
options = weboptions(...
    'RequestMethod', 'put',...
    'MediaType', 'application/x-www-form-urlencoded'...
);
response = webwrite(uri, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

header = HeaderField('Content-Type', 'application/x-www-form-urlencoded');
uri = URI('http://localhost:28139/upload');
body = fileread('new_file');
body(body==13 | body==10) = [];
response = RequestMessage('put', header, body).send(uri.EncodedURI);
