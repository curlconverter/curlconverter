%% Web Access using Data Import and Export API
params = {'type' 'distribution'};
baseURI = 'http://localhost:28139/v2/images';
uri = [baseURI '?' char(join(join(params, '='), '&'))];
options = weboptions(...
    'MediaType', 'application/json',...
    'HeaderFields', {'Authorization' ['Bearer ' getenv('DO_API_TOKEN')]}...
);
response = webread(uri, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

params = {'type' 'distribution'};
header = [
    HeaderField('Content-Type', 'application/json')
    HeaderField('Authorization', ['Bearer ' getenv('DO_API_TOKEN')])
]';
uri = URI('http://localhost:28139/v2/images', QueryParameter(params'));
response = RequestMessage('get', header).send(uri.EncodedURI);
