var models = require('../models');
var randomString = require('randomstring');
var CronJob = require('cron').CronJob;
var Lib = require('../lib');
var lib = new Lib(models.subscriptions);

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
      title: 'Releases notifications of node.js',
      message: 'Hello there!',
      version: version
    });
  });
};

exports.add = function(req, res) {
  var response = '';
  var token = randomString.generate();

  var row = new models.subscriptions();
  row.email = req.body.email;
  row.token = token;
  row.save(function(err) {
    if (err) {
      response = {
        status: false,
        message: err.message
      };
    }
    else {
      response = {
        status: true,
        message: 'You have successfully subscribed! Check email.'
      };

      var emailSubject = 'Validate you\'re subscription';
      var emailMessage = 'Please validate you\'re ' +
      'node.js releases subscription. ' +
      'http://release.nodenica.com/validate/' + token;
      lib.sendEmail(req.body.email, emailSubject, emailMessage);
    }
    res.send(JSON.stringify(response));
  });
};

exports.validate = function(req, res) {
  models.subscriptions.findOne({
    token: req.params.token
  }, function(err, data) {
    if (err) {
      res.render('validate', {
        title: 'Error validating email',
        message: err.message
      });
    }
    else if (data) {
      data.active = true;
      data.save(function(err) {
        if (err) {
          res.render('validate', {
            title: 'Error validating email',
            message: err.message
          });
        }
        else {
          res.render('validate', {
            title: 'Error validating email',
            message: 'You have successfully validated your registration!'
          });
        }
      });
    }
    else {
      res.render('validate', {
        title: 'Error validating email',
        message: 'There is no email linked to your validation code!'
      });
    }
  });
};
