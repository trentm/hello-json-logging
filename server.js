/*
 * A "Hello API" demonstrating restify and bunyan usage.
 */

var restify = require('restify');
var Logger = require('bunyan');


// Create a Bunyan logger with useful serializers (functions that tell
// the logger how to serialize a value for that log record key to JSON).
var log = new Logger({
  name: 'helloapi',
  streams: [
    {
      stream: process.stdout,
      level: 'debug'
    },
    {
      path: 'hello.log',
      level: 'trace'
    }
  ],
  serializers: {
    req: Logger.stdSerializers.req,
    res: restify.bunyan.serializers.res
  }
});


var server = restify.createServer({
  name: 'Hello API',
  log: log   // Pass our logger to restify.
});
server.use(restify.queryParser());

// Let's log every incoming request. `req.log` is a "child" of our logger
// with the following fields added by restify:
// - a `req_id` UUID (to collate all log records for a particular request)
// - a `route` (to identify which handler this was routed to)
server.pre(function (req, res, next) {
  req.log.info({req: req}, 'start');
  return next();
});


// Our API's routes.
server.get({path: '/hello', name: 'SayHello'}, function(req, res, next) {
  var caller = req.params.name || 'caller';
  req.log.debug('caller is "%s"', caller);
  res.send({"hello": caller});
  return next();
});

// Let's log every response. Except 404s, MethodNotAllowed,
// VersionNotAllowed -- see restify's events for these.
server.on('after', function (req, res, route) {
  req.log.info({res: res}, "finished");
});


server.listen(8080, function() {
  log.info('%s listening at <%s>', server.name, server.url);
});
