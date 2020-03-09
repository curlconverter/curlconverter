%% Web Access using Data Import and Export API
uri = 'http://localhost/api/oauth/token/';
body = 'grant_type=client_credentials';
options = weboptions(...
    'Username', 'foo',...
    'Password', 'bar'...
);
response = webwrite(uri, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

uri = URI('http://localhost/api/oauth/token/');
cred = Credentials('Username', 'foo', 'Password', 'bar');
options = HTTPOptions('Credentials', cred);
body = FormProvider('grant_type', 'client_credentials');
response = RequestMessage('post', [], body).send(uri.EncodedURI, options);
