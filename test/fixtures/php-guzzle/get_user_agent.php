<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->get('http://localhost:28139/vc/moviesmagic', [
    'query' => [
        'p' => '5',
        'pub' => 'testmovie',
        'tkn' => '817263812'
    ],
    'headers' => [
        'x-msisdn'   => 'XXXXXXXXXXXXX',
        'user-agent' => 'Mozilla Android6.1'
    ]
]);
