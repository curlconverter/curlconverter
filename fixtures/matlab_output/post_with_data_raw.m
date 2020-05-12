%% Web Access using Data Import and Export API
uri = 'http://example.com/post';
body = 'msg1=wow&msg2=such&msg3=@rawmsg';
response = webwrite(uri, body);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

uri = URI('http://example.com/post');
body = FormProvider('msg1', 'wow', 'msg2', 'such', 'msg3', '@rawmsg');
response = RequestMessage('post', [], body).send(uri.EncodedURI);
