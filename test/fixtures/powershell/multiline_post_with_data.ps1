$headers = @{
    "Origin" = "http://fiddle.jshell.net"
}
$body = @{
    "msg1" = "value1"
    "msg2" = "value2"
}
$response = Invoke-WebRequest -Uri "http://localhost:28139/echo/html/" `
    -Headers $headers `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $body
