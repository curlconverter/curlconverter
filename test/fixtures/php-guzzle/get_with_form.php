<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139/v3', [
    'auth' => ['test', ''],
    'multipart' => [
        [
            'name' => 'from',
            'contents' => 'test@tester.com'
        ],
        [
            'name' => 'to',
            'contents' => 'devs@tester.net'
        ],
        [
            'name' => 'subject',
            'contents' => 'Hello'
        ],
        [
            'name' => 'text',
            'contents' => 'Testing the converter!'
        ]
    ]
]);
