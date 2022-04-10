%% Web Access using Data Import and Export API
uri = 'http://localhost:28139/api/oauth/token/';
body = 'grant_type=client_credentials';
options = weboptions(...
    'Username', 'foo',...
    'Password', 'bar',...
    'MediaType', 'application/x-www-form-urlencoded'...
);
response = webwrite(uri, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

header = HeaderField('Content-Type', 'application/x-www-form-urlencoded');
uri = URI('http://localhost:28139/api/oauth/token/');
cred = Credentials('Username', 'foo', 'Password', 'bar');
options = HTTPOptions('Credentials', cred);
body = FormProvider('grant_type', 'client_credentials');
response = RequestMessage('post', header, body).send(uri.EncodedURI, options);
