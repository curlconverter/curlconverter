<?php
include('vendor/rmccue/requests/library/Requests.php');
Requests::register_autoloader();
$headers = array();
$data = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}';
$options = array('auth' => array('admin', '123'));
$response = Requests::put('http://localhost:5984/test/_security', $headers, $data, $options);