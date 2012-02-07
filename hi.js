var Logger = require('bunyan');
var log = new Logger({name: 'hello' /*, ... */});
log.info("hi %s", "paul");
