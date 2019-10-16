from scrapy import Request, Spider
from w3lib.http import basic_auth_header


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        auth = basic_auth_header(
            'username',
            'password',
        )
        headers = {
            'Accept': 'application/vnd.go.cd.v4+json',
            'Content-Type': 'application/json',
            'Authorization': auth,
        }
        body = '{\n        "hostname": "agent02.example.com",\n        "agent_config_state": "Enabled",\n        "resources": ["Java","Linux"],\n        "environments": ["Dev"]\n        }'
        yield Request(
            'https://ci.example.com/go/api/agents/adb9540a-b954-4571-9d9b-2f330739d4da',
            callback=self.parse,
            method='PATCH',
            headers=headers,
            body=body,
        )

    def parse(self, response):
        pass
