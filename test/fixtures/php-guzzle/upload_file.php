<?php
require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Psr7;

$client = new Client();

$response = $client->put('http://localhost:28139/file.txt', [
    'body' => Psr7\Utils::tryFopen('file.txt', 'r')
]);
