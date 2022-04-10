%% Web Access using Data Import and Export API
uri = 'http://localhost:28139/';
options = weboptions('HeaderFields', {'Authorization' ['Basic ' matlab.net.base64encode(':some_password')]});
response = webread(uri, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

uri = URI('http://localhost:28139/');
cred = Credentials('Password', 'some_password');
options = HTTPOptions('Credentials', cred);
response = RequestMessage().send(uri.EncodedURI, options);
