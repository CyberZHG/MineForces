var fs = require('fs');
var request = require('request');
var FileCookieStore = require('tough-cookie-filestore');
var log = require('./log')

var cookie_jar = request.jar(new FileCookieStore('cookies.json'));
request = request.defaults({jar: cookie_jar});

Crawler = function() {
  this.problems = {};
  this.total_page_num = 0;
}

Crawler.prototype.parseAccepted = function(row, problem) {
  var accepted_regex = /accepted-problem/;
  var result = accepted_regex.exec(row);
  problem.accepted = result !== null;
}

Crawler.prototype.parseId = function(row, problem) {
  var problem_id_regex = /<td class="id">.*?>.*?([0-9A-Z]+).*?<\/a>/;
  var result = problem_id_regex.exec(row);
  if (result === null) {
    return false;
  }
  problem.id = result[1];
  return true;
}

Crawler.prototype.parseTitle = function(row, problem) {
  var title_regex = /<div style="float:left;">.*?<a.*?>(.*?)<\/a>/;
  var result = title_regex.exec(row);
  if (result === null) {
    return false;
  }
  problem.title = result[1].trim();
  return true;
}

Crawler.prototype.parseTags = function(row, problem) {
  var tag_regex = /<a.*?class="notice".*?>(.*?)<\/a>/g;
  var result;
  while (result = tag_regex.exec(row)) {
    problem.tags.push(result[1]);
  }
}

Crawler.prototype.parseSolved = function(row, problem) {
  var solved_regex = /user.png"\/>&nbsp;x(\d+)/;
  var result = solved_regex.exec(row);
  if (result === null) {
    return false;
  }
  problem.solved = parseInt(result[1]);
  return true;
}

Crawler.prototype.parseProblem = function(row) {
  var problem = {
    accepted: false,
    id: '',
    title: '',
    tags: [],
    solved: -1
  };
  this.parseAccepted(row, problem);
  if (!this.parseId(row, problem)) {
    return;
  }
  if (!this.parseTitle(row, problem)) {
    return;
  }
  this.parseTags(row, problem);
  if (!this.parseSolved(row, problem)) {
    return;
  }
  this.setProblem(problem);
}

Crawler.prototype.setProblem = function(problem) {
  this.problems[problem.id] = problem;
}

Crawler.prototype.save = function() {
  fs.writeFile('problems.json', JSON.stringify(this.problems));
}

Crawler.prototype.load = function(callback) {
  var context = this;
  fs.readFile('problems.json', function(err, data) {
    if (err) {
      log.fail(err);
      callback([]);
    } else {
      context.problems = JSON.parse(data);
      if (callback) {
        callback(context.problems);
      }
    }
  });
}

Crawler.prototype.parseTotalPageNum = function(body) {
  var page_num_regex = /problemset\/page\/(\d+)/g;
  var result;
  while (result = page_num_regex.exec(body)) {
    var page_num = parseInt(result[1]);
    if (page_num > this.total_page_num) {
      this.total_page_num = page_num;
    }
  }
  log.info('Problemset page number: ' + this.total_page_num);
}

Crawler.prototype.pullProblemsAt = function(page_num, retry_num, callback) {
  if ((this.total_page_num > 0 && page_num > this.total_page_num) || retry_num >= 3) {
    this.save();
    if (callback) {
      callback(this.problems);
    }
    return;
  }
  if (retry_num == 0) {
    log.info('Pulling problems on page ' + page_num);
  } else {
    log.info('Pulling problems on page ' + page_num + ' the ' + (retry_num + 1) + ' time');
  }
  var context = this;
  request('http://codeforces.com/problemset/page/' + page_num, function(error, response, body) {
    if (error || response.statusCode != 200) {
      context.pullProblemsAt(page_num, retry_num + 1, callback);
    } else {
      body = body.replace(/(\r\n|\n|\r)/gm, '');
      var problem_table_regex = /<table class="problems">(.*)<\/table>/;
      var rows_html_result = problem_table_regex.exec(body);
      if (rows_html_result === null) {
        context.pullProblemsAt(page_num, retry_num + 1, callback);
      } else {
        var rows_html = rows_html_result[1];
        var table_row_regex = /<tr .*?<\/tr>/g;
        var result;
        while (result = table_row_regex.exec(rows_html)) {
          context.parseProblem(result[0]);
        }
        if (context.total_page_num == 0) {
          context.parseTotalPageNum(body);
        }
        context.pullProblemsAt(page_num + 1, 0, callback);
      }
    }
  });
}

Crawler.prototype.pullProblems = function(callback) {
  this.pullProblemsAt(1, 0, callback);
}

exports.pullProblems = function(callback) {
  var crawler = new Crawler();
  crawler.pullProblems(callback);
}

exports.loadProblems = function(callback) {
  var crawler = new Crawler();
  crawler.load(callback);
}