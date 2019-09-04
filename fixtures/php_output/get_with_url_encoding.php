<?php
include('vendor/rmccue/requests/library/Requests.php');
Requests::register_autoloader();
$headers = array();
$data = array(
    'data' => '1',
    'text' => '%D2%D4'
);
$response = Requests::post('http://example.com', $headers, $data);
