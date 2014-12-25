var request = require('request');
var nodemailer = require('nodemailer');
var fs = require('fs');
var util = require('util');

var Lib = function(model) {
  var self = this;
  self.model = model;

  self.url = 'http://nodejs.org/dist/latest/';

  self.logFile = './version.log';

  self.getHash = function(cb) {
    request(self.url, function(error, response, body) {
      if (error) {
        cb(error.message, null);
      }
      else if (response.statusCode != 200) {
        cb(util.format('Invalid response from request %d', response.statusCode));
      }
      else {
        var versionMath = body.match(/node-(v\d{1,3}\.\d{1,3}\.\d{1,3})\.tar\.gz/gi);
        var versionString = versionMath[0].replace(/node-(v\d{1,3}\.\d{1,3}\.\d{1,3})\.tar\.gz/gi, '$1');
        cb(null, versionString);
      }
    });
  };

  self.getCache = function(cb) {
    fs.readFile(self.logFile, 'utf8', function(error, data) {
      if (error) {
        cb(error.message, null);
      }
      else {
        cb(null, data);
      }
    });
  };

  self.setCache = function(hash, cb) {
    fs.writeFile(self.logFile, hash, function(error) {
      if (error) {
        cb(error.message, null);
      }
      else {
        cb(null, 'Done!');
      }
    });
  };

  self.sendEmail = function(to, subject, message) {

    var transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_SMTP_USERNAME,
        pass: process.env.SENDGRID_SMTP_PASSWORD
      }
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: 'Node Releases <node-releases@nodenica.com>', // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: message, // plaintext body
      html: message // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      }
      else {
        console.log('Message sent: ' + info.response);
      }
    });
  };

  self.check = function() {
    self.getHash(function(error, hash) {
      if (error) {
        self.sendEmail('✗ getHash Error', error);
      }
      else if (fs.existsSync(self.logFile)) {
        self.getCache(function(error, cacheHash) {
          if (error) {
            self.sendEmail('✗ getCache Error', error);
          }
          else if (hash === cacheHash) {
            console.log(':(');
          }
          else {
            self.setCache(hash, function(error, response) {
              if (error) {
                self.sendEmail('✗ setCache Error', error);
              }
              else {
                self.model.find({active: true}, function(err, subscribers) {
                  if (err) {
                    console.log(err);
                  }
                  else if (subscribers.lengt > 0) {
                    subscribers.forEach(function(subscriber) {
                      var emailSubject = 'New node.js Release ' + hash;
                      var emailMessage = 'node.js ' + hash +
                      ' http://nodejs.org/dist/latest/';
                      self.sendEmail(subscriber.email, emailSubject, emailMessage);
                    });
                  }
                });
              }
            });
          }
        });
      }
      else {
        self.setCache(hash, function(error, response) {
          if (error) {
            self.sendEmail('✗ setCache Error', error);
          }
          else {
            console.log('Cache created!');
          }
        });
      }
    });
  }
}

module.exports = Lib;
