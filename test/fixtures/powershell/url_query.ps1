$body = @{
    "foo" = "bar"
    "baz" = "qux"
}
$response = Invoke-WebRequest -Uri "http://localhost:28139" -Body $body


$body = @{
    "prmsare" = "perurl"
    "secondparam" = "yesplease"
    "foo" = "bar"
    "baz" = "qux"
}
$response = Invoke-WebRequest -Uri "http://localhost:28139/" -Body $body


$response = Invoke-WebRequest -Uri "http://localhost:28139?trailingamper=shouldwork&&foo=bar&baz=qux"


$response = Invoke-WebRequest -Uri "http://localhost:28139?noequalshouldnt&foo=bar&baz=qux"
