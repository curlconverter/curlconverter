use LWP::UserAgent;
use MIME::Base64;

$ua = LWP::UserAgent->new();
$response = $ua->get(
    'http://localhost:28139/',
    Authorization => "Basic " . MIME::Base64::encode('some_username:some_password')
);
