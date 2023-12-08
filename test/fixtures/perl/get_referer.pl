use LWP::UserAgent;

$ua = LWP::UserAgent->new();
$response = $ua->get(
    'http://localhost:28139',
    'X-Requested-With' => 'XMLHttpRequest',
    'User-Agent' => 'SimCity',
    Referer => 'https://website.com'
);
