%% Web Access using Data Import and Export API
params = {
    'p' '5'
    'pub' 'testmovie'
    'tkn' '817263812'
};
baseURI = 'http://205.147.98.6/vc/moviesmagic';
uri = [baseURI '?' char(join(join(params, '='), '&'))];
options = weboptions(...
    'UserAgent', 'Mozilla Android6.1',...
    'HeaderFields', {'x-msisdn' 'XXXXXXXXXXXXX'}...
);
response = webread(uri, options);

% As there is a query, a full URI may be necessary instead.
fullURI = 'http://205.147.98.6/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812';
response = webread(fullURI, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

params = {
    'p' '5'
    'pub' 'testmovie'
    'tkn' '817263812'
};
header = [
    HeaderField('x-msisdn', 'XXXXXXXXXXXXX')
    HeaderField('User-Agent', 'Mozilla Android6.1')
]';
uri = URI('http://205.147.98.6/vc/moviesmagic', QueryParameter(params'));
response = RequestMessage('get', header).send(uri.EncodedURI);
