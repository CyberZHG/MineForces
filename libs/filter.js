const chalk = require('chalk');
var async = require('async');
var submission_crawler = require('./submission_crawler');

Filter = function(setting, callback) {
  var crawler = require('./submission_crawler');
  this.setting = setting;
  this.team_accepts = {};
  this.chase_accepts = {};
  this.initTeam(0, callback);
}

Filter.prototype.initTeam = function(index, callback) {
  var team = this.setting.getTeam();
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
  var chase = this.setting.getChase();
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

Filter.prototype.checkAccepted = function(problem, index) {
  if (!this.setting.isAllowAccepted(index)) {
    if (this.team_accepts[problem.id]) {
      return false;
    }
  }
  if (this.setting.getChase().length > 0) {
    if (!this.chase_accepts[problem.id]) {
      return false;
    }
  }
  return true;
}

Filter.prototype.checkSolved = function(problem, index) {
  var solved = this.setting.getSolved(index);
  if (solved.length > 0) {
    if (problem.solved > solved[index]) {
      return false;
    }
  }
  return true;
}

Filter.prototype.checkTagAccept = function(problem, index) {
  var tag_accept = this.setting.getTagAccept(index);
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

Filter.prototype.checkTagReject = function(problem, index) {
  var tag_reject = this.setting.getTagReject(index);
  for (var k = 0; k < problem.tags.length; ++k) {
    var tag = problem.tags[k];
    if (tag_reject.indexOf(tag) !== -1) {
      return false;
    }
  }
  return true;
}

Filter.prototype.checkTagRejectIfSingle = function(problem, index) {
  var tag_reject_if_single = this.setting.getTagRejectIfSingle(index);
  if (problem.tags.length == 1) {
    if (tag_reject_if_single.indexOf(problem.tags[0]) !== -1) {
      return false;
    }
  }
  return true;
}

Filter.prototype.checkTagRejectIfNone = function(problem, index) {
  if (this.setting.isTagRejectIfNone(index)) {
    if (problem.tags.length == 0) {
      return false;
    }
  }
  return true;
}

Filter.prototype.checkIdRange = function(problem, index) {
  var low = this.setting.getIdRangeLow(index);
  var high = this.setting.getIdRangeHigh(index);
  return low <= problem.num && problem.num <= high;
}

Filter.prototype.checkIdAlpha = function(problem, index) {
  var alpha = this.setting.getIdAlpha(index);
  if (alpha.length == 0) {
    return true;
  }
  return alpha.indexOf(problem.alpha[0]) >= 0;
}

Filter.prototype.checkRejectSub = function(problem, index) {
  if (this.setting.isRejectSub(index)) {
    if (problem.alpha.length > 1) {
      return false;
    }
  }
  return true;
}

Filter.prototype.isProblemValid = function(problem, index) {
  if (!this.checkAccepted(problem, index)) {
    return false;
  }
  if (!this.checkSolved(problem, index)) {
    return false;
  }
  if (!this.checkTagAccept(problem, index)) {
    return false;
  }
  if (!this.checkTagReject(problem, index)) {
    return false;
  }
  if (!this.checkTagRejectIfSingle(problem, index)) {
    return false;
  }
  if (!this.checkTagRejectIfNone(problem, index)) {
    return false;
  }
  if (!this.checkIdRange(problem, index)) {
    return false;
  }
  if (!this.checkIdAlpha(problem, index)) {
    return false;
  }
  if (!this.checkRejectSub(problem, index)) {
    return false;
  }
  return true;
}

exports.getFilteredProblemSets = function(setting, callback) {
  var problem_crawler = require('./problem_crawler');
  problem_crawler.getProblems(setting.isForceUpdate(), function(problems) {
    new Filter(setting, function(filter) {
      var problem_sets = [];
      var selected_total = {};
      var set_num = setting.getSetNum(setting);
      var problem_num = setting.getProblemNum(setting);
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

exports.outputFilteredProblemSets = function(setting, callback) {
  exports.getFilteredProblemSets(setting, function(problem_sets) {
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
