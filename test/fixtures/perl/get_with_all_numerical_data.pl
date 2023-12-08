use LWP::UserAgent;

$ua = LWP::UserAgent->new();
$response = $ua->post(
    'http://localhost:28139/CurlToNode',
    'Content-Type' => 'application/json',
    Accept => 'application/json',
    Content => '18233982904'
);
