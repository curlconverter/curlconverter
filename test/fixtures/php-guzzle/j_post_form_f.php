<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139/post', [
    'multipart' => [
        [
            'name' => 'd1',
            'contents' => 'data1'
        ],
        [
            'name' => 'd2',
            'contents' => 'data'
        ]
    ]
]);
