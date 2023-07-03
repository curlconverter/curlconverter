$body = @{
    "type" = "distribution"
}
$headers = @{
    "Authorization" = "Bearer $DO_API_TOKEN"
}
$response = Invoke-WebRequest -Uri "http://localhost:28139/v2/images" `
    -Body $body `
    -Headers $headers `
    -ContentType "application/json"
