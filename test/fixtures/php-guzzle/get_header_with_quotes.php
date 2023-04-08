<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139', [
    'headers' => [
        'sec-ch-ua' => '" Not A;Brand";v="99", "Chromium";v="92"'
    ]
]);
