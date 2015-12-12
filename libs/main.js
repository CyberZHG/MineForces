#!/usr/bin/env node
var async = require('async')
var program = require('commander');

program
  .version('0.0.5')
  .option('-u, --user <user_id>', 'the id of your Codeforces account')
  .option('-s, --setting <path>', 'the path of the setting file')
  .parse(process.argv);

async.series([
  function(callback) {
    var login = require('./login');
    if (program.login) {
      login.initRequest(function(request) {
        login.checkEntered(request, function(success) {
          if (success) {
            callback(null);
          } else {
            var prompt = require('prompt');
            prompt.start();
            prompt.get(['username', {name: 'password', hidden: true}], function (err, result) {
              if (err) { 
                console.log('[FAIL]', err); 
              } else {
                login.tryLogin(request, result.username, result.password, function(success) {
                  if (success) {
                    callback(null);
                  }
                });
              }
            });
          }
        });
      });
    } else {
      callback(null);
    }
  },
  function(callback) {
    if (program.crawl) {
      var crawler = require('./crawler');
      crawler.pullProblems(function(problems) {
        callback(null);
      });
    } else {
      callback(null);
    }
  },
  function(callback) {
    if (program.filter) {
      var filter = require('./filter');
      filter.outputFilteredProblemSets(JSON.parse(program.filter), function(problem_sets) {
        callback(null);
      });
    } else {
      callback(null);
    }
  }
]);
