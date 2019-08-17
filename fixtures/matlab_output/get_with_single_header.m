url = 'http://example.com/';
options = weboptions('HeaderFields', {'foo' 'bar'});
response = webread(url, options);
