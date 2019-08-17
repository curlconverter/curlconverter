url = 'http://example.com/targetservice';
files = {'image'; getB64File('image.jpg')};
response = webwrite(url, files{:});

function b64file = getB64File(filename)
    fid = fopen(filename, 'rb');
    bytes = fread(fid);
    fclose(fid);
    encoder = org.apache.commons.codec.binary.Base64;
    b64file = char(encoder.encode(bytes))';
end
