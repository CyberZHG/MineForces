/*jslint node: true */
'use strict';
var fs = require('fs');
var chalk = require('chalk');
var util = require('./util');
var log = require('./log');
var submission_crawler = require('./submission_crawler');

var Filter = function (setting) {
    var filter = {};

    filter.setting = setting;
    filter.team_accepts = {};
    filter.chase_accepts = {};

    filter.init = function (callback) {
        filter.initTeam(0, callback);
    };

    filter.initTeam = function (index, callback) {
        var team = filter.setting.getTeam();
        if (index >= team.length) {
            filter.initChase(0, callback);
        } else {
            submission_crawler.getUserInfo(setting, team[index], function (user_info) {
                Object.keys(user_info.accepts).forEach(function (key) {
                    filter.team_accepts[key] = true;
                });
                filter.initTeam(index + 1, callback);
            });
        }
    };

    filter.initChase = function (index, callback) {
        var chase = filter.setting.getChase();
        if (index >= chase.length) {
            callback();
        } else {
            submission_crawler.getUserInfo(setting, chase[index], function (user_info) {
                Object.keys(user_info.accepts).forEach(function (key) {
                    filter.chase_accepts[key] = true;
                });
                filter.initChase(index + 1, callback);
            });
        }
    };

    filter.checkAccepted = function (problem, index) {
        if (!filter.setting.isAllowAccepted(index)) {
            if (filter.team_accepts[problem.id]) {
                return false;
            }
        }
        if (filter.setting.getChase().length > 0) {
            if (!filter.chase_accepts[problem.id]) {
                return false;
            }
        }
        return true;
    };

    filter.checkSolved = function (problem, index) {
        var solved = filter.setting.getSolved(index);
        if (solved === null) {
            return true;
        }
        if (problem.solved > solved) {
            return false;
        }
        return true;
    };

    filter.checkTagAccept = function (problem, index) {
        var tag_accept = filter.setting.getTagAccept(index);
        if (tag_accept.length === 0) {
            return true;
        }
        return problem.tags.some(function (tag) {
            return tag_accept.indexOf(tag) !== -1;
        });
    };

    filter.checkTagReject = function (problem, index) {
        var tag_reject = filter.setting.getTagReject(index);
        return problem.tags.every(function (tag) {
            return tag_reject.indexOf(tag) === -1;
        });
    };

    filter.checkTagRejectIfSingle = function (problem, index) {
        var tag_reject_if_single = filter.setting.getTagRejectIfSingle(index);
        if (problem.tags.length === 1) {
            if (tag_reject_if_single.indexOf(problem.tags[0]) !== -1) {
                return false;
            }
        }
        return true;
    };

    filter.checkTagRejectIfNone = function (problem, index) {
        if (filter.setting.isTagRejectIfNone(index)) {
            if (problem.tags.length === 0) {
                return false;
            }
        }
        return true;
    };

    filter.checkIdRange = function (problem, index) {
        var low = filter.setting.getIdRangeLow(index),
            high = filter.setting.getIdRangeHigh(index);
        return low <= problem.num && problem.num <= high;
    };

    filter.checkIdAlpha = function (problem, index) {
        var alpha = filter.setting.getIdAlpha(index);
        if (alpha.length === 0) {
            return true;
        }
        return alpha.indexOf(problem.alpha[0]) >= 0;
    };

    filter.checkIdReject = function (problem, index) {
        var rejects = filter.setting.getIdReject(index);
        return rejects.indexOf(problem.id) === -1;
    };

    filter.checkRejectSub = function (problem, index) {
        if (filter.setting.isRejectSub(index)) {
            if (problem.alpha.length > 1) {
                return false;
            }
        }
        return true;
    };

    filter.checkAscii = function (problem, index) {
        if (filter.setting.isAsciiOnly(index)) {
            return problem.title.indexOf('&#') === -1;
        }
        return true;
    };

    filter.isProblemValid = function (problem, index) {
        if (!filter.checkAccepted(problem, index)) {
            return false;
        }
        if (!filter.checkSolved(problem, index)) {
            return false;
        }
        if (!filter.checkTagAccept(problem, index)) {
            return false;
        }
        if (!filter.checkTagReject(problem, index)) {
            return false;
        }
        if (!filter.checkTagRejectIfSingle(problem, index)) {
            return false;
        }
        if (!filter.checkTagRejectIfNone(problem, index)) {
            return false;
        }
        if (!filter.checkIdRange(problem, index)) {
            return false;
        }
        if (!filter.checkIdAlpha(problem, index)) {
            return false;
        }
        if (!filter.checkRejectSub(problem, index)) {
            return false;
        }
        if (!filter.checkAscii(problem, index)) {
            return false;
        }
        return true;
    };

    return filter;
};

exports.getFilteredProblemSets = function (setting, callback) {
    var problem_crawler = require('./problem_crawler');
    problem_crawler.getProblems(setting, function (problems) {
        var filter = new Filter(setting);
        filter.init(function () {
            var problem_sets = [],
                set_num = setting.getSetNum(setting),
                problem_num = setting.getProblemNum(setting),
                filtered_problems = util.new2DArray(problem_num),
                filtered_index = util.newArray(problem_num, 0),
                selected_total = {},
                problem_inc_array = util.newIncArray(problem_num);
            problem_inc_array.forEach(function (index) {
                Object.keys(problems).forEach(function (key) {
                    var problem = problems[key];
                    if (filter.isProblemValid(problem, index)) {
                        filtered_problems[index].push(problem);
                    }
                });
            });
            filtered_problems.forEach(function (val) {
                val.sort(function (a, b) {
                    return b.solved - a.solved;
                });
            });
            util.newIncArray(set_num).forEach(function () {
                var selected_sub = util.newArray(problem_num, -1),
                    problem_set = [];
                problem_inc_array.forEach(function (index) {
                    var key;
                    while (filtered_index[index] < filtered_problems[index].length) {
                        key = filtered_problems[index][filtered_index[index]].id;
                        filtered_index[index] += 1;
                        if (selected_sub.indexOf(key) === -1 && !selected_total.hasOwnProperty(key)) {
                            selected_sub[index] = key;
                            break;
                        }
                    }
                });
                selected_sub.forEach(function (sub) {
                    if (sub !== -1) {
                        selected_total[sub] = true;
                        problem_set.push(problems[sub]);
                    }
                });
                problem_sets.push(problem_set);
            });
            if (callback) {
                callback(problem_sets, filter.team_accepts, filter.chase_accepts, problems);
            }
        });
    });
};

exports.outputFilteredProblemSets = function (setting, callback) {
    exports.getFilteredProblemSets(setting, function (problem_sets, team_accepts, chase_accepts, problems) {
        var isShowTitle = setting.isShowProblemTitle(),
            isShowSolved = setting.isShowProblemSolved(),
            isShowTag = setting.isShowProblemTag(),
            plain = [],
            detail = [];
        problem_sets.forEach(function (problem_set, index) {
            plain.push("Problem Suite " + index);
            detail.push(chalk.yellow("Problem Suite " + index));
            problem_set.forEach(function (problem) {
                if (isShowTitle) {
                    plain.push(problem.id + ' ' + problem.title);
                    detail.push(chalk.green(problem.id) + ' ' + problem.title);
                } else {
                    plain.push(problem.id);
                    detail.push(chalk.green(problem.id));
                }
                if (isShowSolved && isShowTag) {
                    plain.push(problem.solved + ' | ' + problem.tags.join(', '));
                    detail.push(chalk.gray(problem.solved + ' | ' + problem.tags.join(', ')));
                } else if (isShowSolved) {
                    plain.push(problem.solved);
                    detail.push(chalk.gray(problem.solved));
                } else if (isShowTag) {
                    plain.push(problem.tags.join(', '));
                    detail.push(problem.tags.join(', '));
                }
            });
            plain.push('');
            detail.push('');
        });
        console.log(detail.join('\n'));
        if (setting.isOutput()) {
            fs.writeFile(setting.getOutputPath(), plain.join('\n'), function (err) {
                if (err) {
                    log.fail('Error while saving result: ' + err);
                }
                if (callback) {
                    callback(problem_sets, team_accepts, chase_accepts, problems);
                }
            });
        } else {
            if (callback) {
                callback(problem_sets, team_accepts, chase_accepts, problems);
            }
        }
    });
};
