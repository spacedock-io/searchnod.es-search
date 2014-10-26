exports.BadRequest = function (msg) {
  var err = new Error(msg || 'Bad request')
  err.statusCode = 400
  err.code = 'EBADREQUEST'
  return err
}

exports.NotFound = function (msg) {
  var err = new Error(msg || 'Not found')
  err.statusCode = 404
  err.code = 'ENOTFOUND'
  return err
}

exports.ElasticSearchError = function (statusCode, body) {
  var err = new Error('ElasticSearch error')
  err.statusCode = 500
  err.code = 'EELASTICSEARCH'
  err.elasticSearchStatusCode = statusCode
  err.elasticSeachResponse = body
  return err
}
