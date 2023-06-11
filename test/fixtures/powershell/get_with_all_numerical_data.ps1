$headers = @{
    "Accept" = "application/json"
}
$response = Invoke-RestMethod -Uri "http://localhost:28139/CurlToNode" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body "18233982904"
