%% Web Access using Data Import and Export API
cookies = {
    'mysamplecookie' 'someValue'
    'emptycookie' ''
    'otherCookie' '2'
};
uri = 'https://localhost:28139/cookies';
options = weboptions('HeaderFields', {
    'accept' 'application/json'
    'Cookie' char(join(join(cookies, '='), '; '))
});
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
    HeaderField('accept', 'application/json')
    field.CookieField(cellfun(@(x) Cookie(x{:}), num2cell(cookies, 2)))
]';
uri = URI('https://localhost:28139/cookies');
response = RequestMessage('get', header).send(uri.EncodedURI);
