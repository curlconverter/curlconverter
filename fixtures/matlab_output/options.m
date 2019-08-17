url = 'https://layla.amazon.de/api/tunein/queue-and-play';
params = {
    'deviceSerialNumber'; 'xxx^'
    'deviceType'; 'xxx^'
    'guideId'; 's56876^'
    'contentType'; 'station^'
    'callSign'; '^'
    'mediaOwnerCustomerId'; 'xxx'
};
options = weboptions(...
    'RequestMethod', 'options',...
    'UserAgent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',...
    'HeaderFields', {
        'Pragma' 'no-cache'
        'Access-Control-Request-Method' 'POST'
        'Origin' 'https://alexa.amazon.de'
        'Accept-Encoding' 'gzip, deflate, br'
        'Accept-Language' 'de-DE,de;q=0.8,en-US;q=0.6,en;q=0.4'
        'Accept' '*/*'
        'Cache-Control' 'no-cache'
        'Referer' 'https://alexa.amazon.de/spa/index.html'
        'Connection' 'keep-alive'
        'DNT' '1'
        'Access-Control-Request-Headers' 'content-type,csrf'
    }...
);
response = webread(url, params{:}, options);

% NB. Original query string below. It seems impossible to parse and
% reproduce query strings 100% accurately so the one below is given
% in case the reproduced version is not "correct".
fullUrl = 'https://layla.amazon.de/api/tunein/queue-and-play?deviceSerialNumber=xxx^&deviceType=xxx^&guideId=s56876^&contentType=station^&callSign=^&mediaOwnerCustomerId=xxx';
response = webread(fullUrl, options);
