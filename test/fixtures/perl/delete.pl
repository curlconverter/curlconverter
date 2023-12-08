use LWP::UserAgent;

$ua = LWP::UserAgent->new();
$response = $ua->delete('http://localhost:28139/page');
