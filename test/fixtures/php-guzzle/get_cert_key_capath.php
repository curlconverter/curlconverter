<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('https://localhost:28139', [
    'verify' => '/path/to/ca',
    'cert' => '/path/to/cert',
    'ssl_key' => '/path/to/key'
]);
