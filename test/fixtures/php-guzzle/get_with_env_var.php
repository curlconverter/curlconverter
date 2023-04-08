<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139/v2/images', [
    'query' => [
        'type' => 'distribution'
    ],
    'headers' => [
        'Content-Type'  => 'application/json',
        'Authorization' => 'Bearer ' . getenv('DO_API_TOKEN') ?? ''
    ]
]);
