<?php
include('vendor/rmccue/requests/library/Requests.php');
Requests::register_autoloader();
$headers = array();
$data = array(
    'msg1' => 'wow',
    'msg2' => 'such',
    'msg3' => '@rawmsg'
);
$response = Requests::post('http://example.com/post', $headers, $data);
