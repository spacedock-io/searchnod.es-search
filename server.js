var fs = require('fs')
var http = require('http')
var url = require('url')
var qs = require('querystring')
var Joke = require('joke')
var request = require('request')
var bodyJson = require('body/json')
var sendJson = require('send-data/json')
var Router = require('routes-router')
var errors = require('./errors.js')
var sendError = require('./send-error.js')

var config = JSON.parse(fs.readFileSync(process.argv[2]))

var MAX_SIZE = 100
var MIN_QUERY_LENGTH = 3

var log = new Joke()
log.pipe(Joke.stringify()).pipe(process.stdout)
log.info('npmco.de-search starting')

function search(req, res, opts) {
  var params = qs.parse(url.parse(req.url).query)
  var q = params.q
  var from = parseInt(params.from, 10)
  var size = parseInt(params.size, 10)
  var esQs = {}
  var query = {
    query: {
      query_string: {
        fields: ['content']
      }
    },
    filter: {}
  }
  var packageMatch

  log.info('searching', q)

  if (!q)
    return sendError(req, res, errors.BadRequest('Query (`q`) is required'))
  if (q.length < MIN_QUERY_LENGTH)
    return sendError(req, res, errors.BadRequest('Query (`q`) has to be longer than ' + MIN_QUERY_LENGTH))

  if (size) {
    if (Number.isNaN(size))
      return sendError(req, res, errors.BadRequest('Size (`size`) has to be a number'))

    if (size > MAX_SIZE)
      return sendError(req, res, errors.BadRequest('Size (`size`) cannot be greater than ' + MAX_SIZE))

    esQs.size = size
  }

  if (from) {
    if (Number.isNaN(from))
      return sendError(req, res, errors.BadRequest('`from` has to be a number'))

    esQs.from = from
  }

  if ((packageMatch = q.match(/package:(.*?)(?:\s|$)/)) !== null) {
    query.filter.term = { package: packageMatch[1] }
    q = q.replace(packageMatch[0], '')
  }

  query.query.query_string.query = q

  request({
    url: config.elasticsearch + '/files/file/_search',
    qs: esQs,
    method: 'POST',
    json: true,
    body: {
      query: {
        filtered: query
      },
      fields: ['package', 'version', 'filename', 'author'],
      highlight: {
        boundary_chars: '\n',
        boundary_max_scan: 16 * 85, // scan approximately 16 lines
        pre_tags: [''],
        post_tags: [''],
        order: 'score',
        fields: {
          content: {
            number_of_fragments: 10
          }
        }
      }
    }
  }, function (err, res_, body) {
    var results = []

    if (err) return sendError(req, res, err)
    if (res_.statusCode !== 200)
      return sendError(req, res, errors.ElasticSearchError(res_.statusCode, body))

    // Send a 404 here because Michał's framework sucks.
    if (!body.hits || body.hits.hits.length === 0)
      return sendError(req, res, errors.NotFound('No results found'));

    res.setHeader('x-took', body.took.toString())
    body.hits.hits.map(function (hit) {
      var fields = hit.fields
      results.push({
        package: fields.package[0],
        filename: fields.filename[0],
        author: fields.author[0],
        score: hit._score,
        content: hit.highlight.content
      })
    })

    sendJson(req, res, {
      data: {
        total: body.hits.total,
        hits: results
      }
    })
  });
}

var router = new Router()

router.addRoute('/search', {
  POST: search
})

var server = http.createServer(function (req, res) {
  log.info('request', { method: req.method, url: req.url, ip: req.socket.remoteAddress })
  res.setHeader('access-control-allow-origin', config.allowOrigin || '*')
  router.call(this, req, res)
})

server.listen(config.port || 8009, config.host || '127.0.0.1', function () {
  log.info('npmco.de-search listening on ' + server.address().port)
})
