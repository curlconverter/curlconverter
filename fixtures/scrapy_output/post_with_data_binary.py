from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        body = '{"title":"china1"}'
        yield Request(
            'http://example.com/post',
            callback=self.parse,
            method='POST',
            body=body,
        )

    def parse(self, response):
        pass
