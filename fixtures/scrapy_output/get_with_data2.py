from scrapy import Request, Spider


class MySpider(Spider):
    name = 'myspider'

    def start_requests(self):
        headers = {
            'X-Api-Key': '{admin_api_key}',
            'Content-Type': 'application/json',
        }
        yield Request(
            'https://api.newrelic.com/v2/alerts_policy_channels.json?policy_id=policy_id&channel_ids=channel_id',
            callback=self.parse,
            method='PUT',
            headers=headers,
        )

    def parse(self, response):
        pass
