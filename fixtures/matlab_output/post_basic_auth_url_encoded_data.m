url = 'http://localhost/api/oauth/token/';
body = 'grant_type=client_credentials';
options = weboptions(...
    'Username', 'foo',...
    'Password', 'bar'...
);
response = webwrite(url, body, options);