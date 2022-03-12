<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://domain.tld/post-to-me.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, [
	'username' => 'davidwalsh',
	'password' => 'something',
]);

$response = curl_exec($ch);

curl_close($ch);
