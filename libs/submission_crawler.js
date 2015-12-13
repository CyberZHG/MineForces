var fs = require('fs');
var request = require('request');
var log = require('./log')
var util = require('./util');

Crawler = function(user_id) {
  this.total_page_num = 0;
  this.max_sub_num = -1;
  this.user_info = {
    'user_id': user_id,
    'max_sub_num': -1,
    'accepts': {}
  };
  this.finished = false;
}

Crawler.prototype.getSubmissionsPageAt = function(page_num) {
  return 'http://codeforces.com/submissions/' + this.user_info.user_id + '/page/' + page_num;
}

Crawler.prototype.getSaveFilePath = function() {
  return util.getSaveDirectory() + 'user_' + this.user_info.user_id + '.json';
}

Crawler.prototype.parseSubmission = function(row) {
  var submission_id_regex = /data-submission-id="([0-9]+)"/;
  var result = submission_id_regex.exec(row);
  if (result) {
    var submission_id = parseInt(result[1]);
    if (submission_id > this.max_sub_num) {
      this.max_sub_num = submission_id;
    }
    if (submission_id <= this.user_info.max_sub_num) {
      this.finished = true;
      return;
    }
  }
  var accept_regex = /<span class='verdict-accepted'>Accepted<\/span>/;
  if (accept_regex.exec(row)) {
    var problem_id_regex = /problemset\/problem\/([0-9A-Z]+)\/([0-9A-Z]+)/;
    var result = problem_id_regex.exec(row);
    if (result) {
      var problem_id = result[1] + result[2];
      this.user_info.accepts[problem_id] = true;
    }
  }
}

Crawler.prototype.save = function() {
  this.user_info.max_sub_num = this.max_sub_num;
  fs.writeFile(this.getSaveFilePath(), JSON.stringify(this.user_info));
}

Crawler.prototype.load = function(callback) {
  var context = this;
  fs.readFile(this.getSaveFilePath(), function(err, data) {
    if (err) {
      if (callback) {
        callback();
      }
    } else {
      context.user_info = JSON.parse(data);
      context.max_sub_num = context.user_info.max_sub_num;
      if (callback) {
        callback();
      }
    }
  });
}

Crawler.prototype.parseTotalPageNum = function(body) {
  var page_num_regex = /<span class="page-index.*?" pageIndex="(\d+)">/g;
  var result;
  while (result = page_num_regex.exec(body)) {
    var page_num = parseInt(result[1]);
    if (page_num > this.total_page_num) {
      this.total_page_num = page_num;
    }
  }
  log.info('Submissions page count: ' + this.total_page_num);
}

Crawler.prototype.pullSubmissionsAt = function(page_num, retry_num, callback) {
  if (this.finished || (this.total_page_num > 0 && page_num > this.total_page_num) || retry_num >= 3) {
    if (retry_num < 3) {
      this.save();
    }
    if (callback) {
      callback(this.user_info);
    }
    return;
  }
  if (retry_num == 0) {
    log.info('Pulling ' + this.user_info.user_id + '\'s submissions on page ' + page_num);
  } else {
    log.info('Pulling ' + this.user_info.user_id + '\'s submissions on page ' + page_num + ' the ' + (retry_num + 1) + ' time');
  }
  var context = this;
  request(this.getSubmissionsPageAt(page_num), function(error, response, body) {
    if (error || response.statusCode != 200) {
      context.pullSubmissionsAt(page_num, retry_num + 1, callback);
    } else {
      body = body.replace(/(\r\n|\n|\r)/gm, '');
      var problem_table_regex = /<table class="status-frame-datatable">(.*)<\/table>/;
      var rows_html_result = problem_table_regex.exec(body);
      if (rows_html_result === null) {
        context.pullSubmissionsAt(page_num, retry_num + 1, callback);
      } else {
        var rows_html = rows_html_result[1];
        var table_row_regex = /<tr .*?<\/tr>/g;
        var result;
        while (result = table_row_regex.exec(rows_html)) {
          context.parseSubmission(result[0]);
          if (context.finished) {
            break;
          }
        }
        if (!context.finished && context.total_page_num == 0) {
          context.parseTotalPageNum(body);
        }
        context.pullSubmissionsAt(page_num + 1, 0, callback);
      }
    }
  });
}

Crawler.prototype.pullSubmissions = function(callback) {
  this.pullSubmissionsAt(1, 0, callback);
}

exports.getUserInfo = function(user_id, callback) {
  var crawler = new Crawler(user_id);
  crawler.load(function() {
    crawler.pullSubmissions(callback);
  });
}
