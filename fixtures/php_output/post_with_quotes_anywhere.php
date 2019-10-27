<?php
include('vendor/rmccue/requests/library/Requests.php');
Requests::register_autoloader();
$headers = array(
    'A' => '\'\'a\'',
    'B' => '"',
    'Cookie' => 'x=1\'; y=2"'
);
$data = array(
    'a' => 'b',
    'c' => '"',
    'd' => '\''
);
$options = array('auth' => array('ol\'', 'asd"'));
$response = Requests::post('https://example.com', $headers, $data, $options);
