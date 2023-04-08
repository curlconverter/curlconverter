<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139', [
    'timeout' => 6.72,
    'connect_timeout' => 13.9999
]);
