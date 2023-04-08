<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139/', [
    'verify' => '/path/to/ca-bundle.crt',
    'cert' => '/path/to/the/cert'
]);
