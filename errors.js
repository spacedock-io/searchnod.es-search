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
