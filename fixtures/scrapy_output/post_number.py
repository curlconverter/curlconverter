from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        body = '123'
        yield Request(
            'http://a.com',
            callback=self.parse,
            method='POST',
            body=body,
        )

    def parse(self, response):
        pass
