%% Web Access using Data Import and Export API
params = {
    'policy_id' 'policy_id'
    'channel_ids' 'channel_id'
};
baseURI = 'https://api.newrelic.com/v2/alerts_policy_channels.json';
uri = [baseURI '?' char(join(join(params, '='), '&'))];
options = weboptions(...
    'RequestMethod', 'put',...
    'MediaType', 'application/json',...
    'HeaderFields', {'X-Api-Key' '{admin_api_key}'}...
);
response = webread(uri, options);

% As there is a query, a full URI may be necessary instead.
fullURI = 'https://api.newrelic.com/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id';
response = webread(fullURI, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

params = {
    'policy_id' 'policy_id'
    'channel_ids' 'channel_id'
};
header = [
    HeaderField('X-Api-Key', '{admin_api_key}')
    HeaderField('Content-Type', 'application/json')
]';
uri = URI('https://api.newrelic.com/v2/alerts_policy_channels.json', QueryParameter(params'));
response = RequestMessage('put', header).send(uri.EncodedURI);
