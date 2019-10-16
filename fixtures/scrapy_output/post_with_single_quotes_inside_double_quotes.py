from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        body = {
            'foo': '\'bar\'',
        }
        body = '&'.join(key + '=' + value for key, value in body.items())
        yield Request(
            'http://example.com/',
            callback=self.parse,
            method='POST',
            body=body,
        )

    def parse(self, response):
        pass
