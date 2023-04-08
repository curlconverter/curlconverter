<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->put('http://localhost:28139/twitter/_mapping/user?pretty', [
    'headers' => [
        'Content-Type' => 'application/json'
    ],
    // 'body' => '{"properties": {"email": {"type": "keyword"}}}',
    'json' => [
        'properties' => [
            'email' => [
                'type' => 'keyword'
            ]
        ]
    ]
]);
