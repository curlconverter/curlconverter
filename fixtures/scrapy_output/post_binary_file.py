from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'Content-type': 'application/sparql-query',
            'Accept': 'application/sparql-results+json',
        }
        body = open('./sample.sparql', 'rb').read()
        yield Request(
            'http://lodstories.isi.edu:3030/american-art/query',
            callback=self.parse,
            method='POST',
            headers=headers,
            body=body,
        )

    def parse(self, response):
        pass
