$headers = @{
    "Accept" = "application/json"
}
$response = Invoke-RestMethod -Uri "http://localhost:28139" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body "{   }"
