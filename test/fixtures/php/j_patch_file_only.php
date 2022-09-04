<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:28139/patch');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'file1' => new CURLFile('./test/fixtures/curl_commands/delete.sh'),
]);

$response = curl_exec($ch);

curl_close($ch);
