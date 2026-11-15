%% Web Access using Data Import and Export API
% This is not possible with the webread/webwrite API

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

uri = URI('http://localhost:28139/upload');
body = MultipartFormProvider('name', FormProvider('value'));
response = RequestMessage('post', [], body).send(uri.EncodedURI);
