$response = Invoke-WebRequest -Uri "http://localhost:28139" `
    -Method Post `
    -ContentType "application/x-www-form-urlencoded" `
    -Body ""
