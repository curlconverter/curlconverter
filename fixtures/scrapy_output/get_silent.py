from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        yield Request(
            'http://www.google.com',
            callback=self.parse,
        )

    def parse(self, response):
        pass
