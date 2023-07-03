$headers = @{
    "Authorization" = "Bearer ACCESS_TOKEN"
}
$form = @{
    "attributes" = "{`"name`":`"tigers.jpeg`", `"parent`":{`"id`":`"11446498`"}}"
    "file" = Get-Item "myfile.jpg"
}
$response = Invoke-WebRequest -Uri "http://localhost:28139/api/2.0/files/content" `
    -Method Post `
    -Headers $headers `
    -Form $form
