use LWP::UserAgent;

$ua = LWP::UserAgent->new();
$response = $ua->post(
    'http://localhost:28139/post',
    'Content-Type' => 'application/x-www-form-urlencoded',
    Content => 'secret=*%5*!'
);
