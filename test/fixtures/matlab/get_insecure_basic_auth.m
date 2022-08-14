%% Web Access using Data Import and Export API
% This is not possible with the webread/webwrite API

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

uri = URI('http://localhost:28139/');
cred = Credentials('Username', 'some_username', 'Password', 'some_password');
options = HTTPOptions('Credentials', cred, 'VerifyServerName', false);
response = RequestMessage().send(uri.EncodedURI, options);
