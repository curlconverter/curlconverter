url = 'http://api.ipify.org/';
params = {'format'; 'json'};
options = weboptions(...
    'UserAgent', 'GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)',...
    'HeaderFields', {
        'Host' 'api.ipify.org'
        'Accept' '*/*'
        'Accept-Language' 'en-CN;q=1, zh-Hans-CN;q=0.9'
    }...
);
response = webread(url, params{:}, options);

% NB. Original query string below. It seems impossible to parse and
% reproduce query strings 100% accurately so the one below is given
% in case the reproduced version is not "correct".
fullUrl = 'http://api.ipify.org/?format=json&';
response = webread(fullUrl, options);
