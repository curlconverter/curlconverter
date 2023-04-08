<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139/echo/html/', [
    'headers' => [
        'Origin'       => 'http://fiddle.jshell.net',
        'Content-Type' => 'application/x-www-form-urlencoded'
    ],
    'form_params' => [
        'msg1' => 'value1',
        'msg2' => 'value2'
    ]
]);
