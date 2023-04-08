<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139/CurlToNode', [
    'headers' => [
        'Content-Type' => 'application/json',
        'Accept'       => 'application/json'
    ],
    'json' => 18233982904
]);
