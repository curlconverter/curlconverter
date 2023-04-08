<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139/cookies', [
    'headers' => [
        'accept' => 'application/json',
        'Cookie' => 'mysamplecookie=someValue; emptycookie=; otherCookie=2'
    ]
]);
