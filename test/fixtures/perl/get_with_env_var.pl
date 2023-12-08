use LWP::UserAgent;

$ua = LWP::UserAgent->new();
$response = $ua->get(
    'http://localhost:28139/v2/images?type=distribution',
    'Content-Type' => 'application/json',
    Authorization => 'Bearer ' . $ENV{DO_API_TOKEN}
);
