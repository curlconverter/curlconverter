%% Web Access using Data Import and Export API
% This is not possible with the webread/webwrite API

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

params = {
    'deviceSerialNumber' 'xxx'
    'deviceType' 'xxx'
    'guideId' 's56876'
    'contentType' 'station'
    'callSign' ''
    'mediaOwnerCustomerId' 'xxx'
};
header = [
    HeaderField('Pragma', 'no-cache')
    HeaderField('Access-Control-Request-Method', 'POST')
    HeaderField('Origin', 'https://alexa.amazon.de')
    HeaderField('Accept-Encoding', 'gzip, deflate, br')
    HeaderField('Accept-Language', 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4')
    HeaderField('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
    field.AcceptField(MediaType('*/*'))
    HeaderField('Cache-Control', 'no-cache')
    HeaderField('Referer', 'https://alexa.amazon.de/spa/index.html')
    HeaderField('Connection', 'keep-alive')
    HeaderField('DNT', '1')
    HeaderField('Access-Control-Request-Headers', 'content-type,csrf')
]';
uri = URI('http://localhost:28139/api/tunein/queue-and-play', QueryParameter(params'));
response = RequestMessage('options', header).send(uri.EncodedURI);
