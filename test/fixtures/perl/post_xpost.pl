use LWP::UserAgent;

$ua = LWP::UserAgent->new();
$response = $ua->post(
    'http://localhost:28139/api/xxxxxxxxxxxxxxxx',
    'Content-Type' => 'application/x-www-form-urlencoded',
    Content => '{"keywords":"php","page":1,"searchMode":1}'
);
