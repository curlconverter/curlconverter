<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Psr7;

$client = new Client();

$response = $client->put('http://localhost:28139/twitter/_mapping/user?pretty', [
    'headers' => [
        'Content-Type' => 'application/json'
    ],
    'body' => Psr7\Utils::tryFopen('my_file.txt', 'r')
]);
