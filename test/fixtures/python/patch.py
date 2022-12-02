import requests

headers = {
    'Accept': 'application/vnd.go.cd.v4+json',
    'Content-Type': 'application/json',
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

response = requests.patch(
    'http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da',
    headers=headers,
    json=json_data,
    auth=('username', 'password'),
)

# Note: json_data will not be serialized by requests
# exactly as it was in the original request.
#data = '{\n        "hostname": "agent02.example.com",\n        "agent_config_state": "Enabled",\n        "resources": ["Java","Linux"],\n        "environments": ["Dev"]\n        }'
#response = requests.patch(
#    'http://localhost:28139/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da',
#    headers=headers,
#    data=data,
#    auth=('username', 'password'),
#)
