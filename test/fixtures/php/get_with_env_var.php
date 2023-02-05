<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:28139/v2/images?type=distribution');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type' => 'application/json',
    'Authorization' => 'Bearer ',
]);

$response = curl_exec($ch);

curl_close($ch);
