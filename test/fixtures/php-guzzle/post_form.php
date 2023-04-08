<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139/post-to-me.php', [
    'multipart' => [
        [
            'name' => 'username',
            'contents' => 'davidwalsh'
        ],
        [
            'name' => 'password',
            'contents' => 'something'
        ]
    ]
]);
