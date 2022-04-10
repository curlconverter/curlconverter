%% Web Access using Data Import and Export API
params = {
    'test' '2'
    'limit' '100'
    'w' '4'
};
baseURI = 'http://localhost:28139/synthetics/api/v3/monitors';
uri = [baseURI '?' char(join(join(params, '='), '&'))];
options = weboptions('HeaderFields', {'X-Api-Key' '123456789'});
response = webread(uri, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

params = {
    'test' '2'
    'limit' '100'
    'w' '4'
};
header = HeaderField('X-Api-Key', '123456789');
uri = URI('http://localhost:28139/synthetics/api/v3/monitors', QueryParameter(params'));
response = RequestMessage('get', header).send(uri.EncodedURI);
