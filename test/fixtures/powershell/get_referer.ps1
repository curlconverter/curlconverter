$headers = @{
    "X-Requested-With" = "XMLHttpRequest"
    "Referer" = "https://website.com"
}
$response = Invoke-WebRequest -Uri "http://localhost:28139" -Headers $headers -UserAgent "SimCity"
