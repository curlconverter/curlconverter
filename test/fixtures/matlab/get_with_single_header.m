%% Web Access using Data Import and Export API
uri = 'http://localhost:28139/';
options = weboptions('HeaderFields', {'foo' 'bar'});
response = webread(uri, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

header = HeaderField('foo', 'bar');
uri = URI('http://localhost:28139/');
response = RequestMessage('get', header).send(uri.EncodedURI);
