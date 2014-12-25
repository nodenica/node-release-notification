var path = require('path');

exports.setup = function(_mongoose, _db) {

  var fileName = path.basename(__filename, '.js');

  var schema = _mongoose.Schema({
    email: {
      type: String,
      index: {
        unique: true
      }
    },
    token: String,
    active: {
      type: Boolean,
      default: false
    },
    'created_at': {
      type: Date,
      default: Date.now
    }
  });

  _db.model(fileName, schema);

  var data = _db.model(fileName);

  return data;
};
