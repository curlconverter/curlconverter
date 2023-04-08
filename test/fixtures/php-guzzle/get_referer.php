<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139', [
    'headers' => [
        'X-Requested-With' => 'XMLHttpRequest',
        'User-Agent'       => 'SimCity',
        'Referer'          => 'https://website.com'
    ]
]);
