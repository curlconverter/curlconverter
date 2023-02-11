%% Web Access using Data Import and Export API
cookies = {
    'mysamplecookie' 'someValue'
    'emptycookie' ''
    'otherCookie' '2'
};
uri = 'http://localhost:28139/cookies';
options = weboptions(...
    'ContentType', 'json',...
    'HeaderFields', {'Cookie' char(join(join(cookies, '='), '; '))}...
);
response = webread(uri, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*

cookies = {
    'mysamplecookie' 'someValue'
    'emptycookie' ''
    'otherCookie' '2'
};
header = [
    field.AcceptField(MediaType('application/json'))
    field.CookieField(cellfun(@(x) Cookie(x{:}), num2cell(cookies, 2)))
]';
uri = URI('http://localhost:28139/cookies');
response = RequestMessage('get', header).send(uri.EncodedURI);
