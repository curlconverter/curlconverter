<?php
include('vendor/rmccue/requests/library/Requests.php');
Requests::register_autoloader();
$headers = array();
$options = array('auth' => array('some_username', 'some_password'));
$response = Requests::get('https://api.test.com/', $headers, $options);