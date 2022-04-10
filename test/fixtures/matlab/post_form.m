%% Web Access using Data Import and Export API
% This is not possible with the webread/webwrite API

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

uri = URI('http://localhost:28139/post-to-me.php');
body = MultipartFormProvider('username', FormProvider('davidwalsh'), 'password', FormProvider('something'));
response = RequestMessage('post', [], body).send(uri.EncodedURI);
