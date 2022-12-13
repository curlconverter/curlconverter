%% Web Access using Data Import and Export API
uri = 'http://localhost:28139/?format=json&';
options = weboptions(...
    'UserAgent', 'GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)',...
    'HeaderFields', {
        'Host' 'api.ipify.org'
        'Accept' '*/*'
        'Accept-Language' 'en-CN;q=1, zh-Hans-CN;q=0.9'
    }...
);
response = webread(uri, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

header = [
    HeaderField('Host', 'api.ipify.org')
    field.AcceptField(MediaType('*/*'))
    HeaderField('User-Agent', 'GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)')
    HeaderField('Accept-Language', 'en-CN;q=1, zh-Hans-CN;q=0.9')
]';
uri = URI('http://localhost:28139/?format=json&');
response = RequestMessage('get', header).send(uri.EncodedURI);
