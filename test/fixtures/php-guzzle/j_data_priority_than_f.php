<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139/post', [
    'headers' => [
        'Content-Type' => 'application/x-www-form-urlencoded'
    ],
    'form_params' => [
        'data1' => 'data1',
        'data2' => 'data2',
        'data3' => 'data3'
    ]
]);
