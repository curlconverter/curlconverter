local http = require("socket.http")

local body, code, headers, status = http.request{
	method = "POST",
	url = "http://localhost:28139/upload"
}
