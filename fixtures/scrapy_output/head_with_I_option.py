from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        yield Request(
            'http://www.url.com/page',
            callback=self.parse,
            method='HEAD',
        )

    def parse(self, response):
        pass
