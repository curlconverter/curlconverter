%% Web Access using Data Import and Export API
uri = 'https://api.test.com/';
options = weboptions('HeaderFields', {'Authorization' ['Basic ' matlab.net.base64encode(':some_password')]});
response = webread(uri, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

uri = URI('https://api.test.com/');
cred = Credentials('Password', 'some_password');
options = HTTPOptions('Credentials', cred);
response = RequestMessage().send(uri.EncodedURI, options);
