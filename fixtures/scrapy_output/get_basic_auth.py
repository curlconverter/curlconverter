from scrapy import Request, Spider
from w3lib.http import basic_auth_header


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        auth = basic_auth_header(
            'some_username',
            'some_password',
        )
        headers = {
            'Authorization': auth,
        }
        yield Request(
            'https://api.test.com/',
            callback=self.parse,
            headers=headers,
        )

    def parse(self, response):
        pass
