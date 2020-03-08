%% Web Access using Data Import and Export API
% This is not possible with the webread/webwrite API

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

uri = URI('https://example.com/');
options = HTTPOptions('VerifyServerName', false);
response = RequestMessage().send(uri.EncodedURI, options);
