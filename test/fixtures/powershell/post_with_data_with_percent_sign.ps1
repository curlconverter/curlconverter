$response = Invoke-RestMethod -Uri "http://localhost:28139/post" `
    -Method Post `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "secret=*%5*!"
