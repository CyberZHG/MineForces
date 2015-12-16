/*jslint node: true, regexp: true */
'use strict';
var fs = require('fs');
var request = require('request');
var log = require('./log');
var util = require('./util');

var SubmissionCrawler = function (setting, user_id) {
    var crawler = {};
    crawler.setting = setting;
    crawler.total_page_num = 0;
    crawler.max_sub_num = -1;
    crawler.user_info = {
        'user_id': user_id,
        'max_sub_num': -1,
        'accepts': {}
    };
    crawler.finished = false;

    crawler.getSubmissionsPageAt = function (page_num) {
        return 'http://codeforces.com/submissions/' + crawler.user_info.user_id + '/page/' + page_num;
    };

    crawler.getSaveFilePath = function () {
        return util.getSaveDirectory() + 'user_' + crawler.user_info.user_id + '.json';
    };

    crawler.parseSubmission = function (row) {
        var submission_id_regex = /data-submission-id="([0-9]+)"/,
            accept_regex = /<span\ class='verdict-accepted'>Accepted<\/span>/,
            problem_id_regex = /problemset\/problem\/([0-9A-Z]+)\/([0-9A-Z]+)/,
            result = submission_id_regex.exec(row),
            submission_id;
        if (result) {
            submission_id = parseInt(result[1], 10);
            if (submission_id > crawler.max_sub_num) {
                crawler.max_sub_num = submission_id;
            }
            if (submission_id <= crawler.user_info.max_sub_num) {
                crawler.finished = true;
                if (!crawler.setting.isSilent()) {
                    log.info("Found saved submission: " + submission_id);
                }
                return;
            }
        }
        if (accept_regex.exec(row)) {
            result = problem_id_regex.exec(row);
            if (result) {
                crawler.user_info.accepts[result[1] + result[2]] = true;
            }
        }
    };

    crawler.save = function () {
        crawler.user_info.max_sub_num = crawler.max_sub_num;
        fs.writeFile(crawler.getSaveFilePath(), JSON.stringify(crawler.user_info), function (err) {
            if (!crawler.setting.isSilent()) {
                console.log(err);
            }
        });
    };

    crawler.load = function (callback) {
        fs.readFile(crawler.getSaveFilePath(), function (err, data) {
            if (err) {
                if (callback) {
                    callback();
                }
            } else {
                try {
                    crawler.user_info = JSON.parse(data);
                    crawler.max_sub_num = crawler.user_info.max_sub_num;
                } catch (e) {
                    log.fail(e);
                }
                if (callback) {
                    callback();
                }
            }
        });
    };

    crawler.parseTotalPageNum = function (body) {
        var page_num_regex = /<span\ class="page-index.*?"\ pageIndex="(\d+)">/g,
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
            log.info('Submissions page count: ' + crawler.total_page_num);
        }
    };

    crawler.pullSubmissionsAt = function (page_num, retry_num, callback) {
        if (crawler.finished || (crawler.total_page_num > 0 && page_num > crawler.total_page_num) || retry_num >= 3) {
            if (retry_num < 3) {
                // Save to update the last modified date.
                crawler.save();
            }
            if (callback) {
                callback(crawler.user_info);
            }
            return;
        }
        if (!crawler.setting.isSilent()) {
            if (retry_num === 0) {
                log.info('Pulling ' + crawler.user_info.user_id + '\'s submissions on page ' + page_num);
            } else {
                log.info('Pulling ' + crawler.user_info.user_id + '\'s submissions on page ' + page_num + ' the ' + (retry_num + 1) + ' time');
            }
        }
        request(crawler.getSubmissionsPageAt(page_num), function (error, response, body) {
            if (error || response.statusCode !== 200) {
                crawler.pullSubmissionsAt(page_num, retry_num + 1, callback);
            } else {
                body = body.replace(/(\r\n|\n|\r)/gm, '');
                var problem_table_regex = /<table\ class="status-frame-datatable">(.*)<\/table>/,
                    rows_html_result = problem_table_regex.exec(body),
                    table_row_regex = /<tr\ .*?<\/tr>/g,
                    result;
                if (rows_html_result === null) {
                    crawler.pullSubmissionsAt(page_num, retry_num + 1, callback);
                } else {
                    while (true) {
                        result = table_row_regex.exec(rows_html_result[1]);
                        if (result === null) {
                            break;
                        }
                        crawler.parseSubmission(result[0]);
                        if (crawler.finished) {
                            break;
                        }
                    }
                    if (!crawler.finished && crawler.total_page_num === 0) {
                        crawler.parseTotalPageNum(body);
                    }
                    crawler.pullSubmissionsAt(page_num + 1, 0, callback);
                }
            }
        });
    };

    crawler.pullSubmissions = function (callback) {
        fs.stat(crawler.getSaveFilePath(), function (err, stats) {
            if (err) {
                crawler.pullSubmissionsAt(1, 0, callback);
            } else {
                var lastModifiedTime = new Date(stats.mtime),
                    currentTime = Date.now(),
                    diff = currentTime - lastModifiedTime;
                // The submission info is ten minutes ago.
                if (diff > 1000 * 60 * 10 || crawler.setting.isForceUpdate()) {
                    crawler.pullSubmissionsAt(1, 0, callback);
                } else {
                    if (callback) {
                        callback(crawler.user_info);
                    }
                }
            }
        });
    };
    return crawler;
};

exports.getUserInfo = function (setting, user_id, callback) {
    var crawler = new SubmissionCrawler(setting, user_id);
    crawler.load(function () {
        crawler.pullSubmissions(callback);
    });
};
