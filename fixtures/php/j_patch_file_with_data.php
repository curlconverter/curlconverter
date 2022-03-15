<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://httpbin.org/patch');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'file1' => new CURLFile('./fixtures/curl_commands/delete.sh'),
    'form1' => 'form+data+1',
    'form2' => 'form_data_2',
]);

$response = curl_exec($ch);

curl_close($ch);
