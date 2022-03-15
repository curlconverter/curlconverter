import requests

headers = {
    'Accept': 'application/vnd.go.cd.v4+json',
    # Already added when you pass json= but not when you pass data=
    # 'Content-Type': 'application/json',
}

json_data = {
    'hostname': 'agent02.example.com',
    'agent_config_state': 'Enabled',
    'resources': [
        'Java',
        'Linux',
    ],
    'environments': [
        'Dev',
    ],
}

response = requests.patch('https://ci.example.com/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da', headers=headers, json=json_data, auth=('username', 'password'))

# Note: the data is posted as JSON, which might not be serialized
# by Requests exactly as it appears in the original command. So
# the original data is also given.
#data = '{\n        "hostname": "agent02.example.com",\n        "agent_config_state": "Enabled",\n        "resources": ["Java","Linux"],\n        "environments": ["Dev"]\n        }'
#response = requests.patch('https://ci.example.com/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da', headers=headers, data=data, auth=('username', 'password'))
