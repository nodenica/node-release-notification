/**
* @description Read all files and make export for file
*              ignoring index file.
* @type {exports}
*/
var fs = require('fs');
var path = require('path');
var config = require('../config');
var mongoose = require('mongoose');
var util = require('util');

var url = util.format(
  'mongodb://%s:%s@%s:%s/%s',
  config.mongodb.username,
  config.mongodb.password,
  config.mongodb.host,
  config.mongodb.port,
  config.mongodb.db
);

var db = mongoose.createConnection(url);

db.on('error', function() {
  console.log(arguments[0]);
});

db.on('open', function() {
  console.log('Database connected');
});

var files = fs.readdirSync(__dirname);

files.forEach(function(file) {
  var fileName = path.basename(file, '.js');

  if (fileName !== 'index') {
    exports[fileName] = require('./' + fileName).setup(mongoose, db);
  }
});
