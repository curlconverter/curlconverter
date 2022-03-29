<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://example.com');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
curl_setopt($ch, CURLOPT_TIMEOUT, 20);

$response = curl_exec($ch);

curl_close($ch);
