$username = "some_username"
$password = ConvertTo-SecureString "some_password" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $password)
$response = Invoke-WebRequest -Uri "http://localhost:28139/" `
    -Credential $credential `
    -Authentication Basic `
    -AllowUnencryptedAuthentication
