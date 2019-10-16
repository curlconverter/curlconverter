from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'X-Api-Key': '123456789',
        }
        yield Request(
            'https://synthetics.newrelic.com/synthetics/api/v3/monitors?test=2&limit=100&w=4',
            callback=self.parse,
            headers=headers,
        )

    def parse(self, response):
        pass
