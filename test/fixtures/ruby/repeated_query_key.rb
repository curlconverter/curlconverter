require 'net/http'

uri = URI('http://localhost:28139')
params = {
  :key => [
    'one',
    'two'
  ],
}
uri.query = URI.encode_www_form(params)

res = Net::HTTP.get_response(uri)
