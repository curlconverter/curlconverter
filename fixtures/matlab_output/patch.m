%% Web Access using Data Import and Export API
uri = 'https://ci.example.com/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da';
body = struct(...
    'hostname', 'agent02.example.com',...
    'agent_config_state', 'Enabled',...
    'resources', {{
        'Java'
        'Linux'
    }},...
    'environments', {{
        'Dev'
    }}...
);
options = weboptions(...
    'RequestMethod', 'patch',...
    'Username', 'username',...
    'Password', 'password',...
    'MediaType', 'application/json',...
    'HeaderFields', {'Accept' 'application/vnd.go.cd.v4+json'}...
);
response = webwrite(uri, body, options);

%% HTTP Interface
import matlab.net.*
import matlab.net.http.*
import matlab.net.http.io.*

header = [
    field.AcceptField(MediaType('application/vnd.go.cd.v4+json'))
    HeaderField('Content-Type', 'application/json')
];
uri = URI('https://ci.example.com/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da');
cred = Credentials('Username', 'username', 'Password', 'password');
options = HTTPOptions('Credentials', cred);
body = JSONProvider(struct(...
    'hostname', 'agent02.example.com',...
    'agent_config_state', 'Enabled',...
    'resources', {{
        'Java'
        'Linux'
    }},...
    'environments', {{
        'Dev'
    }}...
));
response = RequestMessage('patch', header, body).send(uri.EncodedURI, options);
