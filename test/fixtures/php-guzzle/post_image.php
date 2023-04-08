<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Psr7;

$client = new Client();

$response = $client->post('http://localhost:28139/targetservice', [
    'multipart' => [
        [
            'name' => 'image',
            'contents' => Psr7\Utils::tryFopen('image.jpg', 'r')
        ]
    ]
]);
