url = 'https://upload.box.com/api/2.0/files/content';
files = {
    'attributes'; '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}'
    'file'; getB64File('myfile.jpg')
};
options = weboptions('HeaderFields', {'Authorization' 'Bearer ACCESS_TOKEN'});
response = webwrite(url, files{:}, options);

function b64file = getB64File(filename)
    fid = fopen(filename, 'rb');
    bytes = fread(fid);
    fclose(fid);
    encoder = org.apache.commons.codec.binary.Base64;
    b64file = char(encoder.encode(bytes))';
end
