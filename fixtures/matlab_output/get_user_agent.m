url = 'http://205.147.98.6/vc/moviesmagic';
params = {
    'p'; '5'
    'pub'; 'testmovie'
    'tkn'; '817263812'
};
options = weboptions(...
    'UserAgent', 'Mozilla Android6.1',...
    'HeaderFields', {'x-msisdn' 'XXXXXXXXXXXXX'}...
);
response = webread(url, params{:}, options);

% NB. Original query string below. It seems impossible to parse and
% reproduce query strings 100% accurately so the one below is given
% in case the reproduced version is not "correct".
fullUrl = 'http://205.147.98.6/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812';
response = webread(fullUrl, options);
