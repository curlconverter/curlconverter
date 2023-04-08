<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;

$client = new Client();

$response = $client->post('http://localhost:28139/rest/login-sessions', [
    'headers' => [
        'Content-Type'  => 'application/json',
        'X-API-Version' => '200'
    ],
    // 'body' => '{"userName":"username123","password":"password123", "authLoginDomain":"local"}',
    'json' => [
        'userName' => 'username123',
        'password' => 'password123',
        'authLoginDomain' => 'local'
    ],
    'verify' => false
]);
