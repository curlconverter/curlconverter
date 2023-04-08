<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139', [
    'headers' => [
        'Content-Type' => 'application/json',
        'Accept'       => 'application/json'
    ],
    // 'body' => '{ "drink": "coffe" }',
    'json' => [
        'drink' => 'coffe'
    ]
]);
