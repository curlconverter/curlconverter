%% Web Access using Data Import and Export API
params = {
    'action' 'CreateItem'
    'ID' '-37'
    'AC' '1'
};
cookies = {
    'X-BackEndCookie' 'S-1-5-21-1234556-56678-12345-2345=alphanumericstring12345/anotheralphanumericstring12345/scsiAdf/P'
    'ClientId' 'LoremIupsum'
    'PrivateComputer' 'true'
    'PBack' '0'
    'cadata' 'bx88rrCBehITlBWSozO2l2hlFGu//JjT1/k6dewX5shV32jANUZSMU6GR+M25B6YpBODEgXzxfIHDnvxNC6SJoaE/d8RWX3uDnbkd+m91jNhMXNSYIRYTJHVFdPG06AE'
    'cadataTTL' 'NfDhBViTJMUdC+ir+6BYvg=='
    'cadataKey' 'qUY+OLTD9V14CFK6/CUPyrJWMxl1FFqZFjB8/qcS0/q55eqGvP9bWvX+XuSYVv3hIGAn9QNPhIDK6NP9LwCBdu25f2BUFDUWJruGO8MW02izSWzRUnni00xWQq3Y3nNKvpvO+OIR641BPHVZ0+lzCw2Wt8uzEnryCWAjlleozF/XWjpTN4/AaTmcIjEZUDN+fo4494rD0mADtEHv2gmd5mhLe+iyii/L9nAB3UuiJomwbRbKgy22Tj8cyavmLC4ZaViqW9E102NOLU4FYLgdZVET+mbdg=='
    'cadataIV' 'bTM88YL1zmz7FsBEB0y3nI2SrdSTy+KLxCpx2FRfIZYFo2spN1IHQMSCT76OXrg79sVPhyqXk+N9rOj6M9KsQl4KqMNVBcoXgp24POpgoTwd4FBmKtAYbd9SDErna3jrMO168ML9PDG18K3CnBf6YG1tsIs0gXOEP9LzHVmUPF7KCKqUFiOiZGWuwmPhl85eo77BbEpVN2JkPnzuQWn6tC0cY4f2cJDlr3Z23SrAUVwwXmgRg2DXfOF5MIEkpwYiiI6sABCD9rsSnE6zTXlvZg33hjiD/ywUV1ZWjI2M/4zBixa4s150+dOnMmvtEFs/nOMnvMJui4PEDlTA=='
    'cadataSig' 'WL3hB+av7sO3bzjL+Efe5b4exnvQxSInH3U5jDvfnPcttSp0XUF3y/NB573C0CTBYuOH/40smFssXlrKhT9tG2ITivdSIIamOmarmC8XwFOv9qQIFMHofcO/jjRDMqF0qRk7WBAC2FgBQrf2Tvq7wk5IX/JHn6zhlgKALAAqH9L9JNC244etnjj9YNaMDYEHV2M2jVTu3FsELqw1rSSqp0hEBlh+aFBvYCBg5hS1mVI76ZCHZVa0OUejiH2yiZyJIKHUI+Sv0rpU3iiQNtIFmGEdwhoo/rga4s4Dc2UsJLQ8c0yGlZgflYs+7Q5gPr74/mTUin60ej/w3M0roUl3FQ=='
    'UC' 'd8be544621964f3c9865b3ee872fd432'
    'AppcacheVer' '15.0.1236.3:en-usbase'
    'X-OWA-CANARY' 'VOXQP6xtGkiNnv7E4rFt8TrmclqVFtQI4IJqZflrR7Wz9AMPkMsFoyAlquw1YGsTUxIkVouAcvk.'
};
baseURI = 'http://localhost:28139/api/service.svc';
uri = [baseURI '?' char(join(join(params, '='), '&'))];
body = '{"__type":"CreateItemJsonRequest:#Exchange","Header":{"__type":"JsonRequestHeaders:#Exchange","RequestServerVersion":"Exchange2013","TimeZoneContext":{"__type":"TimeZoneContext:#Exchange","TimeZoneDefinition":{"__type":"TimeZoneDefinitionType:#Exchange","Id":"France Standard Time"}}},"Body":{"__type":"CreateItemRequest:#Exchange","Items":[{"__type":"Message:#Exchange","Subject":"API","Body":{"__type":"BodyContentType:#Exchange","BodyType":"HTML","Value":"<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"><style type=\"text/css\" style=\"display:none\"><!-- p { margin-top: 0px; margin-bottom: 0px; }--></style></head><body dir=\"ltr\" style=\"font-size:12pt;color:#000000;background-color:#FFFFFF;font-family:Calibri,Arial,Helvetica,sans-serif;\"><p>API Test for NickC<br></p></body></html>"},"Importance":"Normal","From":null,"ToRecipients":[{"Name":"George LUCAS","EmailAddress":"George.LUCAS@nih.mail.edu.fr","RoutingType":"SMTP","MailboxType":"Mailbox","OriginalDisplayName":"George.LUCAS@nih.mail.edu.fr","SipUri":" "}],"CcRecipients":[],"BccRecipients":[],"Sensitivity":"Normal","IsDeliveryReceiptRequested":false,"IsReadReceiptRequested":false}],"ClientSupportsIrm":true,"OutboundCharset":"AutoDetect","MessageDisposition":"SendAndSaveCopy","ComposeOperation":"newMail"}}';
options = weboptions(...
    'UserAgent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36',...
    'MediaType', 'application/json; charset=UTF-8',...
    'HeaderFields', {
        'Cookie' char(join(join(cookies, '='), '; '))
        'Origin' 'https://nih.mail.edu.fr'
        'Accept-Encoding' 'gzip, deflate, br'
        'X-EWS-TargetVersion' '2.5'
        'Accept-Language' 'en-US,en;q=0.8'
        'Action' 'CreateItem'
        'X-Requested-With' 'XMLHttpRequest'
        'Connection' 'keep-alive'
        'X-OWA-CANARY' 'VOXQP6xtGkiNnv7E4rFt8TrmclqVFtQI4IJqZflrR7Wz9AMPkMsFoyAlquw1YGsTUxIkVouAcvk.'
        'X-OWA-ActionName' 'CreateMessageForComposeSend'
        'X-OWA-ActionId' '-37'
        'X-OWA-ServiceUnavailableOnTransientError' 'true'
        'Accept' '*/*'
        'Referer' 'https://localhost/api/'
        'X-OWA-ClientBuildVersion' '15.0.1236.3'
        'X-OWA-CorrelationId' '2f11f8fb-f6c6-43a5-881d-8a1b242a4e70_148023102251337'
        'DNT' '1'
        'X-OWA-ClientBegin' '2016-11-27T07:17:02.513'
        'X-OWA-Attempt' '1'
    }...
);
response = webwrite(uri, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

params = {
    'action' 'CreateItem'
    'ID' '-37'
    'AC' '1'
};
cookies = {
    'X-BackEndCookie' 'S-1-5-21-1234556-56678-12345-2345=alphanumericstring12345/anotheralphanumericstring12345/scsiAdf/P'
    'ClientId' 'LoremIupsum'
    'PrivateComputer' 'true'
    'PBack' '0'
    'cadata' 'bx88rrCBehITlBWSozO2l2hlFGu//JjT1/k6dewX5shV32jANUZSMU6GR+M25B6YpBODEgXzxfIHDnvxNC6SJoaE/d8RWX3uDnbkd+m91jNhMXNSYIRYTJHVFdPG06AE'
    'cadataTTL' 'NfDhBViTJMUdC+ir+6BYvg=='
    'cadataKey' 'qUY+OLTD9V14CFK6/CUPyrJWMxl1FFqZFjB8/qcS0/q55eqGvP9bWvX+XuSYVv3hIGAn9QNPhIDK6NP9LwCBdu25f2BUFDUWJruGO8MW02izSWzRUnni00xWQq3Y3nNKvpvO+OIR641BPHVZ0+lzCw2Wt8uzEnryCWAjlleozF/XWjpTN4/AaTmcIjEZUDN+fo4494rD0mADtEHv2gmd5mhLe+iyii/L9nAB3UuiJomwbRbKgy22Tj8cyavmLC4ZaViqW9E102NOLU4FYLgdZVET+mbdg=='
    'cadataIV' 'bTM88YL1zmz7FsBEB0y3nI2SrdSTy+KLxCpx2FRfIZYFo2spN1IHQMSCT76OXrg79sVPhyqXk+N9rOj6M9KsQl4KqMNVBcoXgp24POpgoTwd4FBmKtAYbd9SDErna3jrMO168ML9PDG18K3CnBf6YG1tsIs0gXOEP9LzHVmUPF7KCKqUFiOiZGWuwmPhl85eo77BbEpVN2JkPnzuQWn6tC0cY4f2cJDlr3Z23SrAUVwwXmgRg2DXfOF5MIEkpwYiiI6sABCD9rsSnE6zTXlvZg33hjiD/ywUV1ZWjI2M/4zBixa4s150+dOnMmvtEFs/nOMnvMJui4PEDlTA=='
    'cadataSig' 'WL3hB+av7sO3bzjL+Efe5b4exnvQxSInH3U5jDvfnPcttSp0XUF3y/NB573C0CTBYuOH/40smFssXlrKhT9tG2ITivdSIIamOmarmC8XwFOv9qQIFMHofcO/jjRDMqF0qRk7WBAC2FgBQrf2Tvq7wk5IX/JHn6zhlgKALAAqH9L9JNC244etnjj9YNaMDYEHV2M2jVTu3FsELqw1rSSqp0hEBlh+aFBvYCBg5hS1mVI76ZCHZVa0OUejiH2yiZyJIKHUI+Sv0rpU3iiQNtIFmGEdwhoo/rga4s4Dc2UsJLQ8c0yGlZgflYs+7Q5gPr74/mTUin60ej/w3M0roUl3FQ=='
    'UC' 'd8be544621964f3c9865b3ee872fd432'
    'AppcacheVer' '15.0.1236.3:en-usbase'
    'X-OWA-CANARY' 'VOXQP6xtGkiNnv7E4rFt8TrmclqVFtQI4IJqZflrR7Wz9AMPkMsFoyAlquw1YGsTUxIkVouAcvk.'
};
header = [
    field.CookieField(cellfun(@(x) Cookie(x{:}), num2cell(cookies, 2)))
    HeaderField('Origin', 'https://nih.mail.edu.fr')
    HeaderField('Accept-Encoding', 'gzip, deflate, br')
    HeaderField('X-EWS-TargetVersion', '2.5')
    HeaderField('Accept-Language', 'en-US,en;q=0.8')
    HeaderField('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36')
    HeaderField('Action', 'CreateItem')
    HeaderField('X-Requested-With', 'XMLHttpRequest')
    HeaderField('Connection', 'keep-alive')
    HeaderField('X-OWA-CANARY', 'VOXQP6xtGkiNnv7E4rFt8TrmclqVFtQI4IJqZflrR7Wz9AMPkMsFoyAlquw1YGsTUxIkVouAcvk.')
    HeaderField('X-OWA-ActionName', 'CreateMessageForComposeSend')
    HeaderField('X-OWA-ActionId', '-37')
    HeaderField('X-OWA-ServiceUnavailableOnTransientError', 'true')
    HeaderField('Content-Type', 'application/json; charset=UTF-8')
    field.AcceptField(MediaType('*/*'))
    HeaderField('Referer', 'https://localhost/api/')
    HeaderField('X-OWA-ClientBuildVersion', '15.0.1236.3')
    HeaderField('X-OWA-CorrelationId', '2f11f8fb-f6c6-43a5-881d-8a1b242a4e70_148023102251337')
    HeaderField('DNT', '1')
    HeaderField('X-OWA-ClientBegin', '2016-11-27T07:17:02.513')
    HeaderField('X-OWA-Attempt', '1')
]';
uri = URI('http://localhost:28139/api/service.svc', QueryParameter(params'));
body = StringProvider('{"__type":"CreateItemJsonRequest:#Exchange","Header":{"__type":"JsonRequestHeaders:#Exchange","RequestServerVersion":"Exchange2013","TimeZoneContext":{"__type":"TimeZoneContext:#Exchange","TimeZoneDefinition":{"__type":"TimeZoneDefinitionType:#Exchange","Id":"France Standard Time"}}},"Body":{"__type":"CreateItemRequest:#Exchange","Items":[{"__type":"Message:#Exchange","Subject":"API","Body":{"__type":"BodyContentType:#Exchange","BodyType":"HTML","Value":"<html><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"><style type=\"text/css\" style=\"display:none\"><!-- p { margin-top: 0px; margin-bottom: 0px; }--></style></head><body dir=\"ltr\" style=\"font-size:12pt;color:#000000;background-color:#FFFFFF;font-family:Calibri,Arial,Helvetica,sans-serif;\"><p>API Test for NickC<br></p></body></html>"},"Importance":"Normal","From":null,"ToRecipients":[{"Name":"George LUCAS","EmailAddress":"George.LUCAS@nih.mail.edu.fr","RoutingType":"SMTP","MailboxType":"Mailbox","OriginalDisplayName":"George.LUCAS@nih.mail.edu.fr","SipUri":" "}],"CcRecipients":[],"BccRecipients":[],"Sensitivity":"Normal","IsDeliveryReceiptRequested":false,"IsReadReceiptRequested":false}],"ClientSupportsIrm":true,"OutboundCharset":"AutoDetect","MessageDisposition":"SendAndSaveCopy","ComposeOperation":"newMail"}}');
response = RequestMessage('post', header, body).send(uri.EncodedURI);
