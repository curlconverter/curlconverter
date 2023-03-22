wget --header="'Accept': 'application/json'" \
  --header="Authorization: Bearer 000000000000000-0000" \
  --header="Content-Type: application/json" \
  --post-data=$'{"server_id": "00000000000",\n                   "shared_server": {"library_section_ids": 00000000000,\n                                     "invited_id": 00000000000}\n                   }\n' \
  --output-document - \
  http://localhost:28139/api/servers/00000000000/shared_servers/
