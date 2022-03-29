<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.test.com/');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($ch, CURLOPT_USERPWD, ':some_password');

$response = curl_exec($ch);

curl_close($ch);
