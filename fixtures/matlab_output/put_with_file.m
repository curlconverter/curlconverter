url = 'http://awesomeurl.com/upload';
body = getB64File('new_file');
options = weboptions('RequestMethod', 'put');
response = webwrite(url, body, options);

function b64file = getB64File(filename)
    fid = fopen(filename, 'rb');
    bytes = fread(fid);
    fclose(fid);
    encoder = org.apache.commons.codec.binary.Base64;
    b64file = char(encoder.encode(bytes))';
end
