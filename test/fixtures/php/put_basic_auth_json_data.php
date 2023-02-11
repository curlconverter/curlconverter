<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:28139/test/_security');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
]);
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($ch, CURLOPT_USERPWD, 'admin:123');
curl_setopt($ch, CURLOPT_POSTFIELDS, '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}');

$response = curl_exec($ch);

curl_close($ch);
