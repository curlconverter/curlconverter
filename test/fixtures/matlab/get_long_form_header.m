%% Web Access using Data Import and Export API
uri = 'http://localhost:28139/api/retail/books/list';
options = weboptions(...
    'ContentType', 'json',...
    'HeaderFields', {'user-token' '75d7ce4350c7d6239347bf23d3a3e668'}...
);
response = webread(uri, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

header = [
    field.AcceptField(MediaType('application/json'))
    HeaderField('user-token', '75d7ce4350c7d6239347bf23d3a3e668')
]';
uri = URI('http://localhost:28139/api/retail/books/list');
response = RequestMessage('get', header).send(uri.EncodedURI);
