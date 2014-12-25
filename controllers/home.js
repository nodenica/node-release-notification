var models = require('../models');
var CronJob = require('cron').CronJob;
var Lib = require('../lib');
var lib = new Lib();

lib.check();

new CronJob('00 01 * * * *', function() {
  lib.check();
}, null, true);

exports.home = function(req, res) {
  lib.getCache(function(error, cache) {
    var version = '';
    if (error) {
      version = 'Error';
      console.log(error);
    }
    else {
      version = cache;
    }
    res.render('index', {
      title: 'Hey',
      message: 'Hello there!',
      version: version
    });
  });





};
