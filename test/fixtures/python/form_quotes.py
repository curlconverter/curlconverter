import requests

headers = {
    'Content-Type': 'multipart/related; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
    'Authorization': 'Bearer A21AAGOs8Yauykf6g-avc0v7kdQVJipuyE2NuRdbA7VbOxRDSQLMBUs3HTYbe3mxkZng5VhLuQUhDplE6ZSxjWSSRhAwgDwzg',
}

files = {
    'input': (None, '{"evidences": [{  "evidence_type": "PROOF_OF_FULFILLMENT",  "evidence_info": {  "tracking_info": [    {    "carrier_name": "OTHER",    "tracking_number": "122533485"    }  ]  },  "notes": "Test"}  ]}', 'application/json'),
    'file1': open('NewDoc.pdf', 'rb'),
}

response = requests.post('http://localhost:28139/v1/customer/disputes/PP-D-21692/provide-evidence', headers=headers, files=files)


files = {
    'token': (None, '9d96aaaaaaaaaaaaaaaaaaaaaaaa3541'),
    'cbi.submit': (None, '1'),
    'tab.network.wan': (None, 'general'),
    'cbid.network.wan._fwzone': (None, 'wan'),
    'cbid.network.wan._fwzone.newzone': (None, ''),
    'cbi.cbe.network.wan.ifname_single': (None, '1'),
    'cbid.network.wan.ifname_single': (None, 'eth0.2'),
    'cbid.network.wan.proto': (None, 'pppoe'),
    'cbid.network.wan.ac': (None, ''),
    'cbid.network.wan.service': (None, ''),
    'cbi.cbe.network.wan.auto': (None, '1'),
    'cbid.network.wan.auto': (None, '1'),
    'cbi.cbe.network.wan.delegate': (None, '1'),
    'cbid.network.wan.delegate': (None, '1'),
    'cbi.cbe.network.wan.force_link': (None, '1'),
    'cbid.network.wan.ipv6': (None, 'auto'),
    'cbi.cbe.network.wan.defaultroute': (None, '1'),
    'cbid.network.wan.defaultroute': (None, '1'),
    'cbid.network.wan.metric': (None, '0'),
    'cbi.cbe.network.wan.peerdns': (None, '1'),
    'cbid.network.wan.peerdns': (None, '1'),
    'cbid.network.wan._keepalive_failure': (None, ''),
    'cbid.network.wan._keepalive_interval': (None, ''),
    'cbid.network.wan.demand': (None, ''),
    'cbid.network.wan.mtu': (None, ''),
    'cbi.apply': (None, '保存&应用'),
}

response = requests.post('http://localhost:28139/cgi-bin/luci/admin/network/network/wan', files=files)


headers = {
    'xtoken': 'TOKEN',
}

files = {
    'file': open('/C:/Users/Admin/Downloads/file.txt', 'rb'),
}

response = requests.post(
    'http://localhost:28139/files/upload/ztaaInstaller/0.4.0+0.5.0+ssdf/darwin/arm64/FILE.txt',
    headers=headers,
    files=files,
)


files = {
    'file': open('/Users/myuser/Desktop/weird\\dir/ss.png', 'rb'),
}

response = requests.post('http://localhost:28139/api/v1/files/upload', files=files)


files = {
    'file': ('/var/www/html/voice/test.mp3', open('/var/www/html/voice/test.mp3', 'rb'), 'audio/mpeg'),
}

response = requests.post('http://localhost:28139', files=files)
