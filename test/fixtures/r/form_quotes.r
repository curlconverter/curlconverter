library(httr)

headers = c(
  `Content-Type` = "multipart/related; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
  Authorization = "Bearer A21AAGOs8Yauykf6g-avc0v7kdQVJipuyE2NuRdbA7VbOxRDSQLMBUs3HTYbe3mxkZng5VhLuQUhDplE6ZSxjWSSRhAwgDwzg"
)

files = list(
  input = '{"evidences": [{  "evidence_type": "PROOF_OF_FULFILLMENT",  "evidence_info": {  "tracking_info": [    {    "carrier_name": "OTHER",    "tracking_number": "122533485"    }  ]  },  "notes": "Test"}  ]}',
  file1 = upload_file("NewDoc.pdf")
)

res <- httr::POST(url = "http://localhost:28139/v1/customer/disputes/PP-D-21692/provide-evidence", httr::add_headers(.headers=headers), body = files, encode = "multipart")
