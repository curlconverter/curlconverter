$form = @{
    "name" = "value"
}
$response = Invoke-WebRequest -Uri "http://localhost:28139/upload" -Method Post -Form $form
