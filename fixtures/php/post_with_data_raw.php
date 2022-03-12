<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://example.com/post');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_POSTFIELDS, 'msg1=wow&msg2=such&msg3=@rawmsg');

$response = curl_exec($ch);

curl_close($ch);
