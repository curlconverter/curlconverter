<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Psr7;

$client = new Client();

$response = $client->post('http://localhost:28139/api/2.0/files/content', [
    'headers' => [
        'Authorization' => 'Bearer ACCESS_TOKEN',
        'X-Nice'        => 'Header'
    ],
    'multipart' => [
        [
            'name' => 'attributes',
            'contents' => '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}'
        ],
        [
            'name' => 'file',
            'contents' => Psr7\Utils::tryFopen('myfile.jpg', 'r')
        ]
    ]
]);
