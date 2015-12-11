var async = require('async')
var program = require('commander');

program
  .version('0.0.2')
  .option('-l, --login', 'login to Codeforces')
  .option('-c, --crawl', 'crawl status from Codeforces')
  .parse(process.argv)

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
        crawler = new crawler.Crawler();
        crawler.pullProblems(function(problems) {
          callback(null);
        });
      } else {
        callback(null);
      }
    }
]);




