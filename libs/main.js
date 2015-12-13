#!/usr/bin/env node
var program = require('commander');

program
  .version('0.0.5')
  .option('-s, --setting <path>', 'the path of the setting file')
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
  var problem_crawler = require('./problem_crawler');
  problem_crawler.getProblems(setting.isForceUpdate(user_setting), function(problems) {
    // TODO
  });
});

