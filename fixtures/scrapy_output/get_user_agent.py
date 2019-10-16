from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'x-msisdn': 'XXXXXXXXXXXXX',
            'User-Agent': 'Mozilla Android6.1',
        }
        yield Request(
            'http://205.147.98.6/vc/moviesmagic?p=5&pub=testmovie&tkn=817263812',
            callback=self.parse,
            headers=headers,
        )

    def parse(self, response):
        pass
