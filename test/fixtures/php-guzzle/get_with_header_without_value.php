<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139/get', [
    'headers' => [
        'Content-Type'       => 'text/xml;charset=UTF-8',
        'getWorkOrderCancel' => ''
    ]
]);
