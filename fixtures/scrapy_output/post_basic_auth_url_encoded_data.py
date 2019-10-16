from scrapy import Request, Spider
from w3lib.http import basic_auth_header


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        auth = basic_auth_header(
            'foo',
            'bar',
        )
        headers = {
            'Authorization': auth,
        }
        body = {
            'grant_type': 'client_credentials',
        }
        body = '&'.join(key + '=' + value for key, value in body.items())
        yield Request(
            'http://localhost/api/oauth/token/',
            callback=self.parse,
            method='POST',
            headers=headers,
            body=body,
        )

    def parse(self, response):
        pass
