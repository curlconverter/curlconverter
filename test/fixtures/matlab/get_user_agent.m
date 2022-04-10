%% Web Access using Data Import and Export API
params = {
    'p' '5'
    'pub' 'testmovie'
    'tkn' '817263812'
};
baseURI = 'http://localhost:28139/vc/moviesmagic';
uri = [baseURI '?' char(join(join(params, '='), '&'))];
options = weboptions(...
    'UserAgent', 'Mozilla Android6.1',...
    'HeaderFields', {'x-msisdn' 'XXXXXXXXXXXXX'}...
);
response = webread(uri, options);

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
    HeaderField('user-agent', 'Mozilla Android6.1')
]';
uri = URI('http://localhost:28139/vc/moviesmagic', QueryParameter(params'));
response = RequestMessage('get', header).send(uri.EncodedURI);
