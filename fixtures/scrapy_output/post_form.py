from scrapy import FormRequest, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        formdata = {
            'username': 'davidwalsh',
            'password': 'something',
        }
        yield FormRequest(
            'http://domain.tld/post-to-me.php',
            formdata=formdata,
            callback=self.parse,
        )

    def parse(self, response):
        pass
