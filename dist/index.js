
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./relinx.cjs.production.min.js')
} else {
  module.exports = require('./relinx.cjs.development.js')
}
