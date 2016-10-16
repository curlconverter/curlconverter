<?php
include('vendor/rmccue/requests/library/Requests.php');
Requests::register_autoloader();
$headers = array();
$data = array(
    'field' => 'don\'t you like quotes'
);
$response = Requests::post('google.com', $headers, $data);