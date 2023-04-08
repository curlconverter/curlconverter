<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139', [
    'proxy' => 'http://localhost:8080'
]);
