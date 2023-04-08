<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->put('http://localhost:28139/test/_security', [
    'headers' => [
        'Content-Type' => 'application/x-www-form-urlencoded'
    ],
    'auth' => ['admin', '123'],
    'body' => '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'
]);
