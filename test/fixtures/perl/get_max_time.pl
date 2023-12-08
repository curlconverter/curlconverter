use LWP::UserAgent;

$ua = LWP::UserAgent->new(timeout => 20);
$response = $ua->get('http://localhost:28139');
