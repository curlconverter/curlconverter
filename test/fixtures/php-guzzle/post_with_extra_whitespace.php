<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Psr7;

$client = new Client();

$response = $client->post('http://localhost:28139/api/library', [
    'headers' => [
        'accept'       => 'application/json',
        'Content-Type' => 'multipart/form-data'
    ],
    'multipart' => [
        [
            'name' => 'files',
            'contents' => Psr7\Utils::tryFopen('47.htz', 'r')
        ],
        [
            'name' => 'name',
            'contents' => '47'
        ],
        [
            'name' => 'oldMediaId',
            'contents' => '47'
        ],
        [
            'name' => 'updateInLayouts',
            'contents' => '1'
        ],
        [
            'name' => 'deleteOldRevisions',
            'contents' => '1'
        ]
    ]
]);
