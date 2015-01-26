module.exports = ->
    (req, res, next) ->
        authorization = req.headers.authorization
        return res.send 200 if not authorization? and req.method is "OPTIONS"
        next()