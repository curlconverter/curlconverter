<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:28139/?format=json&');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Host: api.ipify.org',
    'Accept: */*',
    'User-Agent: GiftTalk/2.7.2 (iPhone; iOS 9.0.2; Scale/3.00)',
    'Accept-Language: en-CN;q=1, zh-Hans-CN;q=0.9',
    'Accept-Encoding: gzip',
]);

$response = curl_exec($ch);

curl_close($ch);
