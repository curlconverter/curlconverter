%% Web Access using Data Import and Export API
uri = 'http://localhost:28139/page';
options = weboptions('RequestMethod', 'delete');
response = webread(uri, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

uri = URI('http://localhost:28139/page');
response = RequestMessage('delete').send(uri.EncodedURI);
