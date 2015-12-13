const chalk = require('chalk');
var async = require('async');
var setting = require('./setting');
var submission_crawler = require('./submission_crawler');

Filter = function(user_setting, callback) {
  var crawler = require('./submission_crawler');
  this.user_setting = user_setting;
  this.team_accepts = {};
  this.chase_accepts = {};
  this.initTeam(0, callback);
}

Filter.prototype.initTeam = function(index, callback) {
  var team = setting.getTeam(this.user_setting);
  if (index >= team.length) {
    this.initChase(0, callback);
  } else {
    var context = this;
    submission_crawler.getUserInfo(team[index], function(user_info) {
      for (var key in user_info.accepts) {
        context.team_accepts[key] = true;
      }
      context.initTeam(index + 1, callback);
    });
  }
}

Filter.prototype.initChase = function(index, callback) {
  var chase = setting.getChase(this.user_setting);
  if (index >= chase.length) {
    callback(this);
  } else {
    var context = this;
    submission_crawler.getUserInfo(chase[index], function(user_info) {
      for (var key in user_info.accepts) {
        context.chase_accepts[key] = true;
      }
      context.initChase(index + 1, callback);
    });
  }
}

Filter.prototype.checkAccepted = function(problem) {
  if (!setting.isAllowAccepted(this.user_setting)) {
    if (this.team_accepts[problem.id]) {
      return false;
    }
  }
  if (setting.getChase(this.user_setting).length > 0) {
    if (!this.chase_accepts[problem.id]) {
      return false;
    }
  }
  return true;
}

Filter.prototype.checkSolved = function(problem, index) {
  var solved = setting.getSolved(this.user_setting);
  if (solved.length > 0) {
    if (problem.solved > solved[index]) {
      return false;
    }
  }
  return true;
}

Filter.prototype.checkTagAccept = function(problem) {
  var tag_accept = setting.getTagAccept(this.user_setting);
  if (tag_accept.length == 0) {
    return true;
  }
  for (var k = 0; k < problem.tags.length; ++k) {
    var tag = problem.tags[k];
    if (tag_accept.indexOf(tag) !== -1) {
      return true;
    }
  }
  return false;
}

Filter.prototype.checkTagReject = function(problem) {
  var tag_reject = setting.getTagReject(this.user_setting);
  for (var k = 0; k < problem.tags.length; ++k) {
    var tag = problem.tags[k];
    if (tag_reject.indexOf(tag) !== -1) {
      return false;
    }
  }
  return true;
}

Filter.prototype.checkTagRejectIfSingle = function(problem) {
  var tag_reject_if_single = setting.getTagRejectIfSingle(this.user_setting);
  if (problem.tags.length == 1) {
    if (tag_reject_if_single.indexOf(problem.tags[0]) !== -1) {
      return false;
    }
  }
  return true;
}

Filter.prototype.checkTagRejectIfNone = function(problem) {
  if (setting.isTagRejectIfNone(this.user_setting)) {
    if (problem.tags.length == 0) {
      return false;
    }
  }
  return true;
}

Filter.prototype.isProblemValid = function(problem, index) {
  if (!this.checkAccepted(problem)) {
    return false;
  }
  if (!this.checkSolved(problem, index)) {
    return false;
  }
  if (!this.checkTagAccept(problem)) {
    return false;
  }
  if (!this.checkTagReject(problem)) {
    return false;
  }
  if (!this.checkTagRejectIfSingle(problem)) {
    return false;
  }
  if (!this.checkTagRejectIfNone(problem)) {
    return false;
  }
  return true;
}

exports.getFilteredProblemSets = function(user_setting, callback) {
  var problem_crawler = require('./problem_crawler');
  problem_crawler.getProblems(setting.isForceUpdate(user_setting), function(problems) {
    new Filter(user_setting, function(filter) {
      var problem_sets = [];
      var selected_total = {};
      var set_num = setting.getSetNum(user_setting);
      var problem_num = setting.getProblemNum(user_setting);
      for (var i = 0; i < set_num; ++i) {
        var selected_sub = [];
        for (var j = 0; j < problem_num; ++j) {
          selected_sub.push(-1);
        }
        for (var j = 0; j < problem_num; ++j) {
          var selected_problem = -1;
          for (var key in problems) {
            var problem = problems[key];
            if (selected_sub.indexOf(key) === -1 && !(key in selected_total)) {
              if (filter.isProblemValid(problem, j)) {
                if (selected_problem == -1 || problems[key].solved > problems[selected_problem].solved) {
                  selected_problem = key;
                }
              }
            }
          }
          selected_sub[j] = selected_problem;
        }
        var problem_set = [];
        for (var j = 0; j < selected_sub.length; ++j) {
          if (selected_sub[j] != -1) {
            selected_total[selected_sub[j]] = true;
            problem_set.push(problems[selected_sub[j]]);
          }
        }
        problem_sets.push(problem_set);
      }
      if (callback) {
        callback(problem_sets);
      }
    });
  });
};

exports.outputFilteredProblemSets = function(user_setting, callback) {
  exports.getFilteredProblemSets(user_setting, function(problem_sets) {
    for (var i = 0; i < problem_sets.length; ++i) {
      console.log(chalk.yellow("Problem Suite " + i));
      for (var j = 0; j < problem_sets[i].length; ++j) {
        var problem = problem_sets[i][j];
        console.log(chalk.green(problem.id) + ' ' + problem.title);
        console.log(chalk.gray(problem.solved + ' | ' + problem.tags.join(', ')));
      }
      console.log();
    }
    if (callback) {
      callback(problem_sets);
    }
  });
};
