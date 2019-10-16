from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        yield Request(
            'https://www.site.com',
            callback=self.parse,
        )

    def parse(self, response):
        pass

# To disable SSL certificate verification, see:
# https://stackoverflow.com/a/32951168
