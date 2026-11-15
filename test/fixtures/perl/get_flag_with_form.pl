use LWP::UserAgent;

$ua = LWP::UserAgent->new();
$response = $ua->post(
    'http://localhost:28139/upload',
    Content_Type => 'form-data',
    Content => [
        name => 'value'
    ]
);
