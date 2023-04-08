<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139/', [
    'headers' => [
        'Content-Type' => 'application/x-www-form-urlencoded'
    ],
    'body' => "foo=\\'bar\\'"
]);
