url = 'http://localhost:9200/twitter/_mapping/user';
params = {'pretty'; ''};
body = '{"properties": {"email": {"type": "keyword"}}}';
options = weboptions(...
    'RequestMethod', 'put',...
    'MediaType', 'application/json'...
);
query = char(join(join(reshape(params,[],2)','='),'&'));
response = webwrite([url '?' query], body, options);

% NB. Original query string below. It seems impossible to parse and
% reproduce query strings 100% accurately so the one below is given
% in case the reproduced version is not "correct".
fullUrl = 'http://localhost:9200/twitter/_mapping/user?pretty';
response = webwrite(fullUrl, body, options);
