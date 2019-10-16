from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'foo': 'bar',
        }
        yield Request(
            'http://example.com/',
            callback=self.parse,
            headers=headers,
        )

    def parse(self, response):
        pass
