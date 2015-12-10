const chalk = require('chalk');

exports.info = function(msg) {
  console.log(chalk.yellow("[INFO] " + msg));
};

exports.fail = function(msg) {
  console.log(chalk.red("[FAIL] " + msg));
};

exports.success = function(msg) {
  console.log(chalk.green("[SUCCESS] " + msg));
};
