%% Web Access using Data Import and Export API
uri = 'http://lodstories.isi.edu:3030/american-art/query';
body = fileread('./sample.sparql');
options = weboptions('HeaderFields', {
    'Content-type' 'application/sparql-query'
    'Accept' 'application/sparql-results+json'
});
response = webwrite(uri, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

header = [
    HeaderField('Content-type', 'application/sparql-query')
    field.AcceptField(MediaType('application/sparql-results+json'))
]';
uri = URI('http://lodstories.isi.edu:3030/american-art/query');
body = FileProvider('./sample.sparql');
response = RequestMessage('post', header, body).send(uri.EncodedURI);
