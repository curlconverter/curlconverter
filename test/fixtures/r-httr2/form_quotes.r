library(httr2)

request("http://localhost:28139/v1/customer/disputes/PP-D-21692/provide-evidence") |>
  req_method("POST") |>
  req_headers(Authorization = "Bearer A21AAGOs8Yauykf6g-avc0v7kdQVJipuyE2NuRdbA7VbOxRDSQLMBUs3HTYbe3mxkZng5VhLuQUhDplE6ZSxjWSSRhAwgDwzg") |>
  req_body_multipart(
    input = '{"evidences": [{  "evidence_type": "PROOF_OF_FULFILLMENT",  "evidence_info": {  "tracking_info": [    {    "carrier_name": "OTHER",    "tracking_number": "122533485"    }  ]  },  "notes": "Test"}  ]}',
    file1 = curl::form_file("NewDoc.pdf")
  ) |>
  req_perform(verbosity = 1)
