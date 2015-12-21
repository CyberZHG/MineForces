/*jslint node: true, regexp: true*/
'use strict';
var fs = require('fs');
var request = require('request');
var log = require('./log');
var util = require('./util');

var PROBLEM_FILE = util.getSaveDirectory() + 'problems.json';

var ProblemCrawler = function (setting) {
    var crawler = {};
    crawler.setting = setting;
    crawler.problems = {};
    crawler.total_page_num = 0;

    crawler.parseId = function (row, problem) {
        var problem_id_regex = /<td\ class="id">.*?>.*?([0-9]+)([0-9A-Z]+).*?<\/a>/,
            result = problem_id_regex.exec(row);
        if (result === null) {
            return false;
        }
        problem.id = result[1] + result[2];
        problem.num = result[1];
        problem.alpha = result[2];
        return true;
    };

    crawler.parseTitle = function (row, problem) {
        var title_regex = /<div\ style="float:left;">.*?<a.*?>(.*?)<\/a>/,
            result = title_regex.exec(row);
        if (result === null) {
            return false;
        }
        problem.title = result[1].trim();
        return true;
    };

    crawler.parseTags = function (row, problem) {
        var tag_regex = /<a.*?class="notice".*?>(.*?)<\/a>/g,
            result;
        while (true) {
            result = tag_regex.exec(row);
            if (result === null) {
                break;
            }
            problem.tags.push(result[1]);
        }
    };

    crawler.parseSolved = function (row, problem) {
        var solved_regex = /user.png"\/>&nbsp;x(\d+)/,
            result = solved_regex.exec(row);
        if (result === null) {
            return false;
        }
        problem.solved = parseInt(result[1], 10);
        return true;
    };

    crawler.parseProblem = function (row) {
        var problem = {
            id: '',
            title: '',
            tags: [],
            solved: -1
        };
        if (!crawler.parseId(row, problem)) {
            return;
        }
        if (!crawler.parseTitle(row, problem)) {
            return;
        }
        crawler.parseTags(row, problem);
        if (!crawler.parseSolved(row, problem)) {
            return;
        }
        crawler.problems[problem.id] = problem;
    };

    crawler.save = function () {
        fs.writeFile(PROBLEM_FILE, JSON.stringify(crawler.problems), function (err) {
            if (err) {
                console.log(err);
            }
        });
    };

    crawler.load = function (callback) {
        fs.readFile(PROBLEM_FILE, function (err, data) {
            if (err) {
                crawler.pullProblems(callback);
            } else {
                try {
                    crawler.problems = JSON.parse(data);
                    if (callback) {
                        callback(crawler.problems);
                    }
                } catch (e) {
                    if (!crawler.setting.isSilent()) {
                        log.fail('Error while reading problems: ' + e);
                    }
                    crawler.pullProblems(callback);
                }
            }
        });
    };

    crawler.parseTotalPageNum = function (body) {
        var page_num_regex = /problemset\/page\/(\d+)/g,
            result,
            page_num;
        while (true) {
            result = page_num_regex.exec(body);
            if (result === null) {
                break;
            }
            page_num = parseInt(result[1], 10);
            if (page_num > crawler.total_page_num) {
                crawler.total_page_num = page_num;
            }
        }
        if (!crawler.setting.isSilent()) {
            log.info('Problemset page count: ' + crawler.total_page_num);
        }
    };

    crawler.pullProblemsAt = function (page_num, retry_num, callback) {
        if ((crawler.total_page_num > 0 && page_num > crawler.total_page_num) || retry_num >= 3) {
            crawler.save();
            if (callback) {
                callback(crawler.problems);
            }
            return;
        }
        if (!crawler.setting.isSilent()) {
            if (retry_num === 0) {
                log.info('Pulling problems on page ' + page_num);
            } else {
                log.info('Pulling problems on page ' + page_num + ' the ' + (retry_num + 1) + ' time');
            }
        }
        request('http://codeforces.com/problemset/page/' + page_num, function (error, response, body) {
            if (error || response.statusCode !== 200) {
                crawler.pullProblemsAt(page_num, retry_num + 1, callback);
            } else {
                body = body.replace(/(\r\n|\n|\r)/gm, '');
                var problem_table_regex = /<table\ class="problems">(.*)<\/table>/,
                    rows_html_result = problem_table_regex.exec(body),
                    table_row_regex = /<tr\ .*?<\/tr>/g,
                    result;
                if (rows_html_result === null) {
                    crawler.pullProblemsAt(page_num, retry_num + 1, callback);
                } else {
                    while (true) {
                        result = table_row_regex.exec(rows_html_result[1]);
                        if (result === null) {
                            break;
                        }
                        crawler.parseProblem(result[0]);
                    }
                    if (crawler.total_page_num === 0) {
                        crawler.parseTotalPageNum(body);
                    }
                    crawler.pullProblemsAt(page_num + 1, 0, callback);
                }
            }
        });
    };

    crawler.pullProblems = function (callback) {
        crawler.pullProblemsAt(1, 0, callback);
    };

    return crawler;
};

exports.getProblems = function (setting, callback) {
    var crawler = new ProblemCrawler(setting);
    if (setting.isForceUpdate()) {
        crawler.pullProblems(callback);
    } else {
        fs.stat(PROBLEM_FILE, function (err, stats) {
            if (err) {
                crawler.pullProblems(callback);
            } else {
                var lastModifiedTime = new Date(stats.mtime),
                    currentTime = Date.now(),
                    diff = currentTime - lastModifiedTime;
                // The problem info is one week ago.
                if (diff > 1000 * 60 * 60 * 24 * 7) {
                    crawler.pullProblems(callback);
                } else {
                    crawler.load(callback);
                }
            }
        });
    }
};
