use LWP::UserAgent;

$ua = LWP::UserAgent->new();
$response = $ua->get(
    'http://localhost:28139/echo/html/',
    Origin => 'http://fiddle.jshell.net',
    'Content-Type' => 'application/x-www-form-urlencoded',
    Content => 'msg1=value1&msg2=value2'
);
