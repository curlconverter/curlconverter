%% Web Access using Data Import and Export API
% This is not possible with the webread/webwrite API

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

header = [
    HeaderField('Content-Type', 'application/json')
    HeaderField('X-API-Version', '200')
]';
uri = URI('http://localhost:28139/rest/login-sessions');
options = HTTPOptions('VerifyServerName', false);
body = JSONProvider(struct(...
    'userName', 'username123',...
    'password', 'password123',...
    'authLoginDomain', 'local'...
));
response = RequestMessage('post', header, body).send(uri.EncodedURI, options);
