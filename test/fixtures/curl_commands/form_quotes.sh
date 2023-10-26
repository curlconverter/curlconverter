curl -v -X POST http://localhost:28139/v1/customer/disputes/PP-D-21692/provide-evidence -H "Content-Type: multipart/related; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW" -H "Authorization: Bearer A21AAGOs8Yauykf6g-avc0v7kdQVJipuyE2NuRdbA7VbOxRDSQLMBUs3HTYbe3mxkZng5VhLuQUhDplE6ZSxjWSSRhAwgDwzg" -F 'input={"evidences": [{  "evidence_type": "PROOF_OF_FULFILLMENT",  "evidence_info": {  "tracking_info": [    {    "carrier_name": "OTHER",    "tracking_number": "122533485"    }  ]  },  "notes": "Test"}  ]};type=application/json' -F 'file1=@NewDoc.pdf'

curl --location --request POST 'http://localhost:28139/cgi-bin/luci/admin/network/network/wan' \
  --form 'token="9d96aaaaaaaaaaaaaaaaaaaaaaaa3541"' \
  --form 'cbi.submit="1"' \
  --form 'tab.network.wan="general"' \
  --form 'cbid.network.wan._fwzone="wan"' \
  --form 'cbid.network.wan._fwzone.newzone=""' \
  --form 'cbi.cbe.network.wan.ifname_single="1"' \
  --form 'cbid.network.wan.ifname_single="eth0.2"' \
  --form 'cbid.network.wan.proto="pppoe"' \
  --form 'cbid.network.wan.ac=""' \
  --form 'cbid.network.wan.service=""' \
  --form 'cbi.cbe.network.wan.auto="1"' \
  --form 'cbid.network.wan.auto="1"' \
  --form 'cbi.cbe.network.wan.delegate="1"' \
  --form 'cbid.network.wan.delegate="1"' \
  --form 'cbi.cbe.network.wan.force_link="1"' \
  --form 'cbid.network.wan.ipv6="auto"' \
  --form 'cbi.cbe.network.wan.defaultroute="1"' \
  --form 'cbid.network.wan.defaultroute="1"' \
  --form 'cbid.network.wan.metric="0"' \
  --form 'cbi.cbe.network.wan.peerdns="1"' \
  --form 'cbid.network.wan.peerdns="1"' \
  --form 'cbid.network.wan._keepalive_failure=""' \
  --form 'cbid.network.wan._keepalive_interval=""' \
  --form 'cbid.network.wan.demand=""' \
  --form 'cbid.network.wan.mtu=""' \
  --form 'cbi.apply="保存&应用"'


curl --location --request POST 'localhost:28139/files/upload/ztaaInstaller/0.4.0+0.5.0+ssdf/darwin/arm64/FILE.txt' \
  --header 'xtoken: TOKEN' \
  --form 'file=@"/C:/Users/Admin/Downloads/file.txt"'


curl --location 'http://localhost:28139/api/v1/files/upload' \
  --form 'file=@"/Users/myuser/Desktop/weird\\dir/ss.png"'

curl 'http://localhost:28139' --form 'file=@/var/www/html/voice/test.mp3;type=audio/mpeg'
