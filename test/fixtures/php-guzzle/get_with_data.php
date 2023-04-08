<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139/synthetics/api/v3/monitors', [
    'query' => [
        'test' => '2',
        'limit' => '100',
        'w' => '4'
    ],
    'headers' => [
        'X-Api-Key' => '123456789'
    ]
]);
