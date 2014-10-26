var sendJson = require('send-data/json')

function stringifyError(err) {
  var result = {}
  Object.getOwnPropertyNames(err).forEach(function (key) {
    result[key] = err[key]
  })
  return result
}

module.exports = function (req, res, err) {
  sendJson(req, res, {
    statusCode: err.statusCode || 500,
    body: JSON.stringify(stringifyError(err))
  })
}
