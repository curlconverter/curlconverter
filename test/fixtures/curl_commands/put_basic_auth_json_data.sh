curl -X PUT http://localhost:28139/test/_security -u "admin:123" -d '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'
