from scrapy import FormRequest, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        # To implement file uploads in Scrapy, see:
        # https://stackoverflow.com/a/39312565
        formdata = {}
        yield FormRequest(
            'http://example.com/targetservice',
            formdata=formdata,
            callback=self.parse,
        )

    def parse(self, response):
        pass
