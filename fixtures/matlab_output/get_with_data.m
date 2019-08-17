url = 'https://synthetics.newrelic.com/synthetics/api/v3/monitors';
params = {
    'test'; '2'
    'limit'; '100'
    'w'; '4'
};
options = weboptions('HeaderFields', {'X-Api-Key' '123456789'});
response = webread(url, params{:}, options);

% NB. Original query string below. It seems impossible to parse and
% reproduce query strings 100% accurately so the one below is given
% in case the reproduced version is not "correct".
fullUrl = 'https://synthetics.newrelic.com/synthetics/api/v3/monitors?test=2&limit=100&w=4';
response = webread(fullUrl, options);
