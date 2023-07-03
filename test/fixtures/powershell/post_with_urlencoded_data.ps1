$headers = @{
    "Origin" = "http://fiddle.jshell.net"
    "Accept-Encoding" = "gzip, deflate"
    "Accept-Language" = "en-US,en;q=0.8"
    "Accept" = "*/*"
    "Referer" = "http://fiddle.jshell.net/_display/"
    "X-Requested-With" = "XMLHttpRequest"
    "Connection" = "keep-alive"
}
$body = @{
    "msg1" = "wow"
    "msg2" = "such"
}
$response = Invoke-WebRequest -Uri "http://localhost:28139/echo/html/" `
    -Method Post `
    -Headers $headers `
    -UserAgent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36" `
    -ContentType "application/x-www-form-urlencoded; charset=UTF-8" `
    -Body $body
