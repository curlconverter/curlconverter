<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:28139/');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_DIGEST);
curl_setopt($ch, CURLOPT_USERPWD, 'some_username:some_password');

$response = curl_exec($ch);

curl_close($ch);
