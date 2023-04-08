<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->patch('http://localhost:28139/patch', [
    'headers' => [
        'Content-Type' => 'application/x-www-form-urlencoded'
    ],
    'body' => 'item[]=1&item[]=2&item[]=3'
]);
