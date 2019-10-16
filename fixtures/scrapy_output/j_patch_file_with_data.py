from scrapy import FormRequest, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        # To implement file uploads in Scrapy, see:
        # https://stackoverflow.com/a/39312565
        formdata = {
            'form1': 'form+data+1',
            'form2': 'form_data_2',
        }
        yield FormRequest(
            'http://httpbin.org/patch',
            formdata=formdata,
            callback=self.parse,
            method='PATCH',
        )

    def parse(self, response):
        pass
