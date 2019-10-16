from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'Origin': 'http://fiddle.jshell.net',
        }
        body = {
            'msg1': 'value1',
            'msg2': 'value2',
        }
        body = '&'.join(key + '=' + value for key, value in body.items())
        yield Request(
            'http://fiddle.jshell.net/echo/html/',
            callback=self.parse,
            method='POST',
            headers=headers,
            body=body,
        )

    def parse(self, response):
        pass
