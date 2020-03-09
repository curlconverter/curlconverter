%% Web Access using Data Import and Export API
params = {'format' 'json'};
baseURI = 'http://api.ipify.org/';
uri = [baseURI '?' char(join(join(params, '='), '&'))];
options = weboptions(...
    'UserAgent', 'GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)',...
    'HeaderFields', {
        'Host' 'api.ipify.org'
        'Accept' '*/*'
        'Accept-Language' 'en-CN;q=1, zh-Hans-CN;q=0.9'
    }...
);
response = webread(uri, options);

% As there is a query, a full URI may be necessary instead.
fullURI = 'http://api.ipify.org/?format=json&';
response = webread(fullURI, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

params = {'format' 'json'};
header = [
    HeaderField('Host', 'api.ipify.org')
    field.AcceptField(MediaType('*/*'))
    HeaderField('User-Agent', 'GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)')
    HeaderField('Accept-Language', 'en-CN;q=1, zh-Hans-CN;q=0.9')
]';
uri = URI('http://api.ipify.org/', QueryParameter(params'));
response = RequestMessage('get', header).send(uri.EncodedURI);
