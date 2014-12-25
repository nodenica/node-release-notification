/**
* @description Read all files and make export for file
*              ignoring index file.
* @type {exports}
*/
var fs = require('fs');
var path = require('path');
var files = fs.readdirSync(__dirname);

files.forEach(function(file) {
  var fileName = path.basename(file, '.js');
  if (fileName !== 'index') {
    exports[fileName] = require('./' + fileName);
  }
});
