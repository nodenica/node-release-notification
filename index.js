var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var controllers = require('./controllers');

var app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/', controllers.home.home);
app.post('/add', controllers.home.add);
app.get('/validate/:token', controllers.home.validate);

var server = app.listen(3000, function() {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

/*
// 00 second 01 minutes every hours
new CronJob('00 01 * * * *', function() {
  lib.check();
}, null, true);

http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  lib.getCache(function(error, cache) {
    var output = '';
    if (error) {
      output = error;
    }
    else {
      output = cache;
    }
    res.end(output);
  });
}).listen(process.env.PORT || 1337, null);
*/
