<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Psr7;

$client = new Client();

$response = $client->patch('http://localhost:28139/patch', [
    'multipart' => [
        [
            'name' => 'file1',
            'contents' => Psr7\Utils::tryFopen('./test/fixtures/curl_commands/delete.sh', 'r')
        ]
    ]
]);
