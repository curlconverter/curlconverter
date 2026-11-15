<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:28139/upload');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'name' => 'value',
]);

$response = curl_exec($ch);

curl_close($ch);
