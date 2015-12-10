var log = require('./log');

var COOKIE_JAR_FILE = 'cookies.json';

exports.initRequest = function(callback) {
  var fs = require('fs');
  var request = require('request');
  var FileCookieStore = require('tough-cookie-filestore');
  fs.exists(COOKIE_JAR_FILE, function(exists) {
    if (exists) {
      var cookie_jar = request.jar(new FileCookieStore(COOKIE_JAR_FILE));
      request = request.defaults({jar: cookie_jar});
      callback(request);
    } else {
      log.info("Cookie file not exist.");
      fs.writeFile(COOKIE_JAR_FILE, '{}', function() {
        var cookie_jar = request.jar(new FileCookieStore(COOKIE_JAR_FILE));
        request = request.defaults({jar: cookie_jar});
        callback(request);
      });
    }
  });
};

exports.checkEntered = function(request, callback) {
  request('http://codeforces.com/', function(error, response, body) {
    if (error || response.statusCode != 200) {
      log.fail("Failed to connect.");
      callback(false);
    } else {
      var enter_regex = /<a href="\/enter">Enter<\/a>/;
      var result = enter_regex.exec(body);
      if (result === null) {
        log.success("User has logged.")
        callback(true);
      } else {
        log.fail("Failed to login.");
        callback(false);
      }
    }
  });
};

exports.tryLogin = function(request, username, password, callback) {
  request('http://codeforces.com/enter', function(error, response, body) {
    if (error || response.statusCode != 200) {
      log.fail("Failed to connect.");
      callback(false);
    } else {
      var csrf_regex = /name='csrf_token' value='([0-9a-zA-Z]+)'/;
      var result = csrf_regex.exec(body);
      if (result === null) {
        log.fail("Failed to obtain CSRF token.");
        callback(false);
      } else {
        log.info("Got CSRF token.");
        var csrf_token = result[1];
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
              log.fail("Failed to obtain CSRF token.");
              callback(false);
            } else {
              log.success("Successfully login.");
              callback(true);
            }
        });
      }
    }
  });
};
