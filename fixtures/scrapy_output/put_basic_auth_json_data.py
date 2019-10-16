from scrapy import Request, Spider
from w3lib.http import basic_auth_header


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        auth = basic_auth_header(
            'admin',
            '123',
        )
        headers = {
            'Authorization': auth,
        }
        body = '{"admins":{"names":[], "roles":[]}, "readers":{"names":["joe"],"roles":[]}}'
        yield Request(
            'http://localhost:5984/test/_security',
            callback=self.parse,
            method='PUT',
            headers=headers,
            body=body,
        )

    def parse(self, response):
        pass
