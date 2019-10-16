from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'Accept': 'application/json',
            'user-token': '75d7ce4350c7d6239347bf23d3a3e668',
        }
        yield Request(
            'http://localhost:8080/api/retail/books/list',
            callback=self.parse,
            headers=headers,
        )

    def parse(self, response):
        pass
