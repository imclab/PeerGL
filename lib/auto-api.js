var parseUrl    = require('url').parse
var path        = require('path')


module.exports = function autoApi(api, views, exts) {
  exts = exts || {}
  exts.html = exts.html || views
  exts.json = exts.json || function (data) {
    return JSON.stringify(data, null, 2)
  }
  return function (req, res, next) {
    var url = parseUrl(req.url).pathname
    var ext = path.extname(url) || ''
    url = url.substring(0, url.length - ext.length)
    ext = (ext || '.html').substring(1)

    var args = url.split('/').filter(Boolean)
    var name = args.shift()
    var method = api[name]
    
    var view   = exts[ext]
    if(view && 'function' !== typeof view)
      view = view[name]

    if(!view)   return next()
    if(!method) return next()
    if(method.length !== args.length + 1)
      return next()

    method.apply(null, args.concat(function (err, data) {
      if(err) return next(err)
      res.end(view(data))
    }))
  }
}

