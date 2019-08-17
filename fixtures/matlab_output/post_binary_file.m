url = 'http://lodstories.isi.edu:3030/american-art/query';
body = getB64File('./sample.sparql');
options = weboptions('HeaderFields', {
        'Content-type' 'application/sparql-query'
        'Accept' 'application/sparql-results+json'
    });
response = webwrite(url, body, options);

function b64file = getB64File(filename)
    fid = fopen(filename, 'rb');
    bytes = fread(fid);
    fclose(fid);
    encoder = org.apache.commons.codec.binary.Base64;
    b64file = char(encoder.encode(bytes))';
end
