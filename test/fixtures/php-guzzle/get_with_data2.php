<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->put('http://localhost:28139/v2/alerts_policy_channels.json', [
    'query' => [
        'policy_id' => 'policy_id',
        'channel_ids' => 'channel_id'
    ],
    'headers' => [
        'X-Api-Key'    => '{admin_api_key}',
        'Content-Type' => 'application/json'
    ]
]);
