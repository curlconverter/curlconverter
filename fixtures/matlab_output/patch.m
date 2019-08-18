url = 'https://ci.example.com/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da';
body = struct(...
    'hostname', 'agent02.example.com', ...
    'agent_config_state', 'Enabled', ...
    'resources', {{
        'Java'
        'Linux'
    }}, ...
    'environments', {{
        'Dev'
    }} ...
);
options = weboptions(...
    'RequestMethod', 'patch',...
    'Username', 'username',...
    'Password', 'password',...
    'MediaType', 'application/json',...
    'HeaderFields', {'Accept' 'application/vnd.go.cd.v4+json'}...
);
response = webwrite(url, body, options);
