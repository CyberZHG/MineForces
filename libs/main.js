var prompt = require('prompt');
var login = require('./login');

prompt.start();

login.initRequest(function(request) {
  login.checkEntered(request, function(success) {
    if (!success) {
       // TODO
    } else {
      prompt.get(['username', {name: 'password', hidden: true}], function (err, result) {
        if (err) { 
          console.log('[FAIL]', err); 
        } else {
          login.tryLogin(request, result.username, result.password, function(success) {
            if (success) {
              // TODO
            }
          });
        }
      });
    }
  });
});
