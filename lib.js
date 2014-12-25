var request = require('request');
var nodemailer = require('nodemailer');
var fs = require('fs');
var util = require('util');

var Lib = function() {
  var self = this;

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

  self.sendEmail = function(subject, message) {

    var transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.USER,
        pass: process.env.PASS
      }
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: 'Node Release <node-release@nodenica.com>', // sender address
      to: 'paulomcnally@gmail.com', // list of receivers
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

    console.log(subject);
    console.log(message);
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
            self.sendEmail('✓ The page has been changed', self.url);
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
