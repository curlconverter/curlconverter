<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'example.com');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'wHat');

$response = curl_exec($ch);

curl_close($ch);
