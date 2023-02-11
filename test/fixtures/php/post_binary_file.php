<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:28139/american-art/query');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-type: application/sparql-query',
    'Accept: application/sparql-results+json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('./sample.sparql'));

$response = curl_exec($ch);

curl_close($ch);
