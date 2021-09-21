%% Web Access using Data Import and Export API
uri = 'http://indeed.com';
response = webread(uri);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

uri = URI('http://indeed.com/');
response = RequestMessage().send(uri.EncodedURI);
