from scrapy import FormRequest, Spider
from w3lib.http import basic_auth_header


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        formdata = {
            'from': 'test@tester.com',
            'to': 'devs@tester.net',
            'subject': 'Hello',
            'text': 'Testing the converter!',
        }
        auth = basic_auth_header(
            'test',
            '',
        )
        headers = {
            'Authorization': auth,
        }
        yield FormRequest(
            'http://\\',
            formdata=formdata,
            callback=self.parse,
            headers=headers,
        )

    def parse(self, response):
        pass
