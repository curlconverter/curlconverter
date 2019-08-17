url = 'https://api.newrelic.com/v2/alerts_policy_channels.json';
params = {
    'policy_id'; 'policy_id'
    'channel_ids'; 'channel_id'
};
options = weboptions(...
    'RequestMethod', 'put',...
    'MediaType', 'application/json',...
    'HeaderFields', {'X-Api-Key' '{admin_api_key}'}...
);
response = webread(url, params{:}, options);

% NB. Original query string below. It seems impossible to parse and
% reproduce query strings 100% accurately so the one below is given
% in case the reproduced version is not "correct".
fullUrl = 'https://api.newrelic.com/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id';
response = webread(fullUrl, options);
