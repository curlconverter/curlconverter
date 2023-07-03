$username = "test"
$password = ConvertTo-SecureString "" -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential($username, $password)
$form = @{
    "from" = "test@tester.com"
    "to" = "devs@tester.net"
    "subject" = "Hello"
    "text" = "Testing the converter!"
}
$response = Invoke-WebRequest -Uri "http://localhost:28139/v3" `
    -Method Post `
    -Credential $credential `
    -Authentication Basic `
    -AllowUnencryptedAuthentication `
    -Form $form
