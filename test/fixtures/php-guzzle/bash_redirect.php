<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139/api/2.0/fo/auth/unix/', [
    'query' => [
        'action' => 'create',
        'title' => 'UnixRecord',
        'username' => 'root',
        'password' => 'abc123',
        'ips' => '10.10.10.10'
    ],
    'headers' => [
        'X-Requested-With' => 'curl',
        'Content-Type'     => 'text/xml'
    ],
    'auth' => ['USER', 'PASS'],
    'body' => '@add_params.xml'
]);
