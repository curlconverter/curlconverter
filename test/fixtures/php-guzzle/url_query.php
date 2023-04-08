<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139', [
    'query' => [
        'foo' => 'bar',
        'baz' => 'qux'
    ]
]);
