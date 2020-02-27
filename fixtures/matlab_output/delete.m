%% Web Access using Data Import and Export API
uri = 'http://www.url.com/page';
options = weboptions('RequestMethod', 'delete');
response = webread(uri, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

uri = URI('http://www.url.com/page');
response = RequestMessage('delete').send(uri.EncodedURI);
