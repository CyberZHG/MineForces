#!/usr/bin/env node
/*jslint node: true*/
'use strict';
var program = require('commander');

program
    .version('0.0.18')
    .option('-s, --setting <path>', 'the path of the setting file')
    .option('-u, --user <user_name>', 'add your id to team value')
    .option('-f, --force', 'force updating the problem information')
    .option('-o, --output <path>', 'save filter result to output path')
    .parse(process.argv);

var fs = require('fs');
var util = require('./util');

function setUserSetting(callback) {
    var log = require('./log'),
        setting = require('./setting');
    setting = new setting.Setting();
    if (program.setting) {
        fs.readFile(program.setting, function (err, data) {
            if (err) {
                log.fail('Cannot find user setting file: ' + program.setting);
            } else {
                var user_setting;
                try {
                    user_setting = JSON.parse(data);
                } catch (e) {
                    log.fail('Invalid JSON file: ' + e);
                }
                if (user_setting) {
                    setting.setUserSetting(user_setting);
                    callback(setting);
                }
            }
        });
    } else {
        callback(setting);
    }
}

function startFiltering() {
    if (program.test) {
        return;
    }
    setUserSetting(function (setting) {
        if (program.user) {
            setting.addUser(program.user);
        }
        if (program.force) {
            setting.setForceUpdate();
        }
        if (program.output) {
            setting.setOutputPath(program.output);
        }
        var filter = require('./filter');
        filter.outputFilteredProblemSets(setting, function (problem_sets, team_accepts, chase_accepts, problems) {
            /*jslint unparam:true*/
            if (setting.isShowTeamStatus()) {
                var status = require('./status');
                status.showStatus(setting, problems, team_accepts);
            }
        });
    });
}

var saveDirectory = util.getSaveDirectory();
fs.exists(saveDirectory, function (exists) {
    if (exists) {
        startFiltering();
    } else {
        fs.mkdir(saveDirectory, function (err) {
            if (err) {
                throw err;
            }
            startFiltering();
        });
    }
});
