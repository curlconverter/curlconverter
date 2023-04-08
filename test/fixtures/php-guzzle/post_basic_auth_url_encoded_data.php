<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139/api/oauth/token/', [
    'headers' => [
        'Content-Type' => 'application/x-www-form-urlencoded'
    ],
    'auth' => ['foo', 'bar'],
    'form_params' => [
        'grant_type' => 'client_credentials'
    ]
]);
