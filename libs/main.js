#!/usr/bin/env node
var program = require('commander');

program
  .version('0.0.9')
  .option('-s, --setting <path>', 'the path of the setting file')
  .option('-u, --user <user_name>', 'add your id to team value')
  .option('-f, --force', 'force updating the problem')
  .parse(process.argv);

var fs = require('fs');
var util = require('./util');

var saveDirectory = util.getSaveDirectory();
if (!fs.existsSync(saveDirectory)){
    fs.mkdirSync(saveDirectory);
}

var setting = require('./setting');

function getUserSetting(callback) {
  var log = require('./log');
  if (program.setting) {
    fs.readFile(program.setting, function(err, data) {
      if (err) {
        log.fail('Cannot find user setting file: ' + program.setting);
      } else {
        var user_setting;
        try {
          user_setting = JSON.parse(data);
        } catch(e) {
          log.fail('Invalid JSON file: ' + e);
        }
        if (user_setting) {
          callback(setting.getUserSetting(user_setting));
        }
      }
    });
  } else {
    callback(setting.getDefaultSetting());
  }
}

getUserSetting(function(user_setting) {
  if (program.user) {
    user_setting = setting.addUser(user_setting, program.user);
  }
  if (program.force) {
    user_setting = setting.setForceUpdate(user_setting);
  }
  var filter = require('./filter');
  filter.outputFilteredProblemSets(user_setting);
});
