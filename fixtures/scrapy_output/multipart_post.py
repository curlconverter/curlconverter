from scrapy import FormRequest, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        # To implement file uploads in Scrapy, see:
        # https://stackoverflow.com/a/39312565
        formdata = {
            'attributes': '{"name":"tigers.jpeg", "parent":{"id":"11446498"}}',
        }
        headers = {
            'Authorization': 'Bearer ACCESS_TOKEN',
        }
        yield FormRequest(
            'https://upload.box.com/api/2.0/files/content',
            formdata=formdata,
            callback=self.parse,
            headers=headers,
        )

    def parse(self, response):
        pass
