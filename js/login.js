var fs = require('fs');
var request = require('request');
var FileCookieStore = require('tough-cookie-filestore');

var COOKIE_JAR_FILE = 'cookies.json';

function disableLoginForm() {
  $('#input_username').prop('disabled', true);
  $('#input_password').prop('disabled', true);
  $('#button_login').prop('disabled', true);
}

function enableLoginForm() {
  $('#input_username').prop('disabled', false);
  $('#input_password').prop('disabled', false);
  $('#button_login').prop('disabled', false);
}

function showInfo(text) {
  $('#panel_info').show();
  $('#panel_danger').hide();
  $('#text_info').text(text);
}

function showDanger(text) {
  $('#panel_danger').show();
  $('#panel_info').hide();
  $('#text_danger').text(text);
}

function hideTexts() {
  $('#panel_info').hide();
  $('#panel_danger').hide();
};
hideTexts();

function checkEntered() {
  showInfo('Checking login status...');
  request('http://codeforces.com/', function(error, response, body) {
    if (!error && response.statusCode == 200) {
       var enter_regex = /<a href="\/enter">Enter<\/a>/;
       var result = enter_regex.exec(body);
       console.log(result);
       if (result === null) {
         window.location.href = 'main.html';
       } else {
         $('#form_login').show();
         hideTexts();
       }
    } else {
       $('#form_login').show();
       hideTexts();
    }
  });
}

function setCookieJar() {
  var cookie_jar = request.jar(new FileCookieStore(COOKIE_JAR_FILE));
  request = request.defaults({jar: cookie_jar});
  checkEntered();
}

fs.exists(COOKIE_JAR_FILE, function(exists) {
  if (!exists) {
    fs.writeFile(COOKIE_JAR_FILE, '{}', function() {
      setCookieJar();
    });
  } else {
    setCookieJar();
  }
});

$('#button_login').click(function() {
  disableLoginForm();
  // Find CSRF token for login.
  showInfo('Connecting to Codeforces...');
  request('http://codeforces.com/enter', function(error, response, body) {
    if (error || response.statusCode != 200) {
      showDanger('Failed to connect to Codeforces');
      enableLoginForm();
    } else {
      var csrf_regex = /name='csrf_token' value='([0-9a-zA-Z]+)'/;
      var result = csrf_regex.exec(body);
      if (result === null) {
        showDanger('Cannot found CSRF token');
        enableLoginForm();
      } else {
        var csrf_token = result[1];
        console.log('CSRF Token: ' + csrf_token);
        // Try login.
        showInfo('Login to Codeforces...');
        var username = $('#input_username').val();
        var password = $('#input_password').val();
        request.post('http://codeforces.com/enter', 
          {form: {
            'csrf_token': csrf_token,
            'action': 'enter',
            'ftaa': '',
            'bfaa': '',
            'handle': username,
            'password': password,
            'remember': 'on'
          }}, 
          function(error, response, body) {
            if (error || response.statusCode != 302) {
              showDanger('Failed to login');
              enableLoginForm();
              console.log(body);
            } else {
              showInfo('Login successfully');
              setTimeout(function() {
                window.location.href = 'main.html';
              }, 100);
            }
        });
      }
    }
  });
});
