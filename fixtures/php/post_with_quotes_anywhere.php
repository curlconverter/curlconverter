<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://example.com');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
	'A' => '\'\'a\'',
	'B' => '"',
]);
curl_setopt($ch, CURLOPT_COOKIE, 'x=1\'; y=2"');
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($ch, CURLOPT_USERPWD, 'ol\':asd"');
curl_setopt($ch, CURLOPT_POSTFIELDS, 'a=b&c="&d=\'');

$response = curl_exec($ch);

curl_close($ch);
