use LWP::UserAgent;

$ua = LWP::UserAgent->new(max_redirect => 20);
$response = $ua->get('http://localhost:28139');
