<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139/endpoint', [
    'headers' => [
        'Content-Type' => 'application/json',
        'key'          => 'abcdefg'
    ]
]);
