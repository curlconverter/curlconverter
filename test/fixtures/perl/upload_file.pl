use LWP::UserAgent;

$ua = LWP::UserAgent->new();
$response = $ua->put('http://localhost:28139/file.txt');
