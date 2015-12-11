const chalk = require('chalk');

const KEY_ACCEPTED = "accepted";
const KEY_SET_NUM = "set_num";
const KEY_PROBLEM_NUM = "problem_num";
const KEY_SOLVED = "solved";
const KEY_ACCEPT_TAG = "accept_tag";
const KEY_REJECT_TAG = "reject_tag";
const KEY_REJECT_SINGLE_TAG = "reject_single_tag";
const KEY_REJECT_NO_TAG = "reject_no_tag";
const KEYS = [KEY_ACCEPTED, KEY_SET_NUM, KEY_PROBLEM_NUM, KEY_SOLVED,
              KEY_ACCEPT_TAG, KEY_REJECT_TAG, KEY_REJECT_SINGLE_TAG, KEY_REJECT_NO_TAG];

function getDefaultFilter() {
  return {KEY_ACCEPTED: false,
          KEY_SET_NUM: 10,
          KEY_PROBLEM_NUM: 5,
          KEY_SOLVED: [5000, 2000, 1000, 500, 100],
          KEY_ACCEPT_TAG: [],
          KEY_REJECT_TAG: [],
          KEY_REJECT_SINGLE_TAG: [],
          KEY_REJECT_NO_TAG: false};
}

function getUserFilter(user_setting) {
  var filter = getDefaultFilter();
  for (var i = 0; i < KEYS.length; ++i) {
    var key = KEYS[i];
    if (key in user_setting) {
      filter[key] = user_setting[key];
    }
  }
  return filter;
}

exports.getFilteredProblemSets = function(user_setting, callback) {
  var crawler = require('./crawler');
  crawler.loadProblems(function(problems) {
    var filter = getUserFilter(user_setting);
    var problem_sets = [];
    var selected_total = {};
    for (var i = 0; i < filter[KEY_SET_NUM]; ++i) {
      var selected_sub = [];
      for (var j = 0; j < filter[KEY_PROBLEM_NUM]; ++j) {
        selected_sub.push(-1);
      }
      for (var j = 0; j < filter[KEY_PROBLEM_NUM]; ++j) {
        for (var key in problems) {
          var problem = problems[key];
          if (!(key in selected_sub) && !(key in selected_total)) {
            if (!filter[KEY_ACCEPTED]) {
              if (problem.accepted) {
                continue;
              }
            }
            if (filter[KEY_SOLVED].length > 0) {
              if (problem.solved > filter[KEY_SOLVED][j]) {
                continue;
              }
            }
            if (filter[KEY_ACCEPT_TAG].length > 0) {
              var appeared = false;
              for (var k = 0; k < problem.tags; ++k) {
                var tag = problem.tags[k];
                if (tag in filter[KEY_ACCEPT_TAG]) {
                  appeared = true;
                  break;
                }
              }
              if (!appeared) {
                continue;
              }
            }
            if (filter[KEY_REJECT_TAG].length > 0) {
              var appeared = false;
              for (var k = 0; k < problem.tags; ++k) {
                var tag = problem.tags[k];
                if (tag in filter[KEY_REJECT_TAG]) {
                  appeared = true;
                  break;
                }
              }
              if (appeared) {
                continue;
              }
            }
            if (filter[KEY_REJECT_SINGLE_TAG].length > 0) {
              if (problem.tags.length == 1) {
                if (problem.tags[0] in filter[KEY_REJECT_SINGLE_TAG]) {
                  continue;
                }
              }
            }
            if (filter[KEY_REJECT_NO_TAG]) {
              if (problem.tags.length == 0) {
                continue;
              }
            }
            if (selected_sub[j] == -1 || problems[key].solved > problems[selected_sub[j]].solved) {
                selected_sub[j] = key;
            }
          }
        }
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
  });
};

exports.outputFilteredProblemSets = function(user_setting, callback) {
  getFilteredProblemSets(user_setting, function(problem_sets) {
    for (var i = 0; i < problem_sets.length; ++i) {
      console.log(chalk.yellow("Problem Suite " + i));
      for (var j = 0; j < problem_sets[i].length; ++j) {
        var problem = problem_sets[i][j];
        console.log(chalk.inverse(problem.key) + ' ' + problem.title);
        console.log(chalk.gray(problem.solved + ' | ' + problem.tags.join(', ')));
      }
      console.log();
    }
    callback(problem_sets);
  });
};
