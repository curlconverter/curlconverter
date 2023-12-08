use LWP::UserAgent;
use File::Slurp;

$ua = LWP::UserAgent->new();
$response = $ua->put(
    'http://localhost:28139/file.txt',
    Content => read_file('file.txt')
);
