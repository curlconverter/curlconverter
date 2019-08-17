url = 'http://domain.tld/post-to-me.php';
files = {
    'username'; 'davidwalsh'
    'password'; 'something'
};
response = webwrite(url, files{:});
