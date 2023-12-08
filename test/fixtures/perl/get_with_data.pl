use LWP::UserAgent;

$ua = LWP::UserAgent->new();
$response = $ua->get(
    'http://localhost:28139/synthetics/api/v3/monitors?test=2&limit=100&w=4',
    'X-Api-Key' => '123456789'
);
