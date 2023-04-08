<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->put('http://localhost:28139/upload', [
    'headers' => [
        'Content-Type' => 'application/x-www-form-urlencoded'
    ],
    'body' => '@new_file'
]);
