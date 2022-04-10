# https://github.com/curlconverter/curlconverter/issues/328
curl -X POST http://localhost:28139/api/servers/00000000000/shared_servers/ -H "'Accept': 'application/json'" -H "Authorization: Bearer 000000000000000-0000" -H "Content-Type: application/json" --data-binary @- <<DATA
{"server_id": "00000000000",
                   "shared_server": {"library_section_ids": 00000000000,
                                     "invited_id": 00000000000}
                   }
DATA
