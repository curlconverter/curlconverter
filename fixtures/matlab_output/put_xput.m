%% Web Access using Data Import and Export API
params = {'pretty' ''};
baseURI = 'http://localhost:9200/twitter/_mapping/user';
uri = [baseURI '?' char(join(join(params, '='), '&'))];
body = struct(...
    'properties', struct(...
        'email', struct(...
            'type', 'keyword'...
        )...
    )...
);
options = weboptions(...
    'RequestMethod', 'put',...
    'MediaType', 'application/json'...
);
response = webwrite(uri, body, options);

% As there is a query, a full URI may be necessary instead.
fullURI = 'http://localhost:9200/twitter/_mapping/user?pretty';
response = webwrite(fullURI, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

params = {'pretty' ''};
header = HeaderField('Content-Type', 'application/json');
uri = URI('http://localhost:9200/twitter/_mapping/user', QueryParameter(params'));
body = JSONProvider(struct(...
    'properties', struct(...
        'email', struct(...
            'type', 'keyword'...
        )...
    )...
));
response = RequestMessage('put', header, body).send(uri.EncodedURI);

% As there is a query, a full URI may be necessary instead.
fullURI = 'http://localhost:9200/twitter/_mapping/user?pretty';
response = RequestMessage('put', header, body).send(fullURI);
