<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139', [
    'headers' => [
        'A'            => "''a'",
        'B'            => '"',
        'Cookie'       => 'x=1\'; y=2"',
        'Content-Type' => 'application/x-www-form-urlencoded'
    ],
    'auth' => ["ol'", 'asd"'],
    'body' => 'a=b&c="&d=\''
]);
