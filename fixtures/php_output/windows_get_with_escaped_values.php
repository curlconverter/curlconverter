<?php
include('vendor/rmccue/requests/library/Requests.php');
Requests::register_autoloader();
$headers = array();
$data = array(
    'a' => 'b',
    'c' => 'd',
    'e' => 'f',
    'h' => 'i',
    'j' => 'k',
    'l' => 'm'
);
$response = Requests::post('http://www.url.com/page', $headers, $data);