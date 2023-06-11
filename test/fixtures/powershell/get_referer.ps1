$headers = @{
    "X-Requested-With" = "XMLHttpRequest"
    "Referer" = "https://website.com"
}
$response = Invoke-RestMethod -Uri "http://localhost:28139" -Headers $headers -UserAgent "SimCity"
