/*jslint node: true */
'use strict';
var fs = require('fs');
var request = require('request');
var log = require('./log');
var util = require('./util');

var SubmissionCrawler = function (user_id) {
    var crawler = {};
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
        var submission_id_regex = /data-submission-id="([0-9]+)"/;
        var result = submission_id_regex.exec(row);
        if (result) {
            var submission_id = parseInt(result[1]);
            if (submission_id > crawler.max_sub_num) {
                crawler.max_sub_num = submission_id;
            }
            if (submission_id <= crawler.user_info.max_sub_num) {
                crawler.finished = true;
                log.info("Found saved submission: " + submission_id);
                return;
            }
        }
        var accept_regex = /<span\ class='verdict-accepted'>Accepted<\/span>/;
        if (accept_regex.exec(row)) {
            var problem_id_regex = /problemset\/problem\/([0-9A-Z]+)\/([0-9A-Z]+)/;
            result = problem_id_regex.exec(row);
            if (result) {
                var problem_id = result[1] + result[2];
                crawler.user_info.accepts[problem_id] = true;
            }
        }
    };

    crawler.save = function () {
        crawler.user_info.max_sub_num = crawler.max_sub_num;
        fs.writeFile(crawler.getSaveFilePath(), JSON.stringify(crawler.user_info));
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
                } catch (e) {
                    log.fail(e);
                }
                crawler.max_sub_num = crawler.user_info.max_sub_num;
                if (callback) {
                    callback();
                }
            }
        });
    };

    crawler.parseTotalPageNum = function (body) {
        var page_num_regex = /<span\ class="page-index.*?"\ pageIndex="(\d+)">/g;
        var result, page_num;
        while (true) {
            result = page_num_regex.exec(body);
            if (result === null) {
                break;
            }
            page_num = parseInt(result[1]);
            if (page_num > crawler.total_page_num) {
                crawler.total_page_num = page_num;
            }
        }
        log.info('Submissions page count: ' + crawler.total_page_num);
    };

    crawler.pullSubmissionsAt = function (page_num, retry_num, callback) {
        if (crawler.finished || (crawler.total_page_num > 0 && page_num > crawler.total_page_num) || retry_num >= 3) {
            if (retry_num < 3 && crawler.max_sub_num > crawler.user_info.max_sub_num) {
                crawler.save();
            }
            if (callback) {
                callback(crawler.user_info);
            }
            return;
        }
        if (retry_num === 0) {
            log.info('Pulling ' + crawler.user_info.user_id + '\'s submissions on page ' + page_num);
        } else {
            log.info('Pulling ' + crawler.user_info.user_id + '\'s submissions on page ' + page_num + ' the ' + (retry_num + 1) + ' time');
        }
        request(crawler.getSubmissionsPageAt(page_num), function (error, response, body) {
            if (error || response.statusCode !== 200) {
                crawler.pullSubmissionsAt(page_num, retry_num + 1, callback);
            } else {
                body = body.replace(/(\r\n|\n|\r)/gm, '');
                var problem_table_regex = /<table\ class="status-frame-datatable">(.*)<\/table>/;
                var rows_html_result = problem_table_regex.exec(body);
                if (rows_html_result === null) {
                    crawler.pullSubmissionsAt(page_num, retry_num + 1, callback);
                } else {
                    var rows_html = rows_html_result[1];
                    var table_row_regex = /<tr\ .*?<\/tr>/g;
                    var result;
                    while (true) {
                        result = table_row_regex.exec(rows_html);
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
        crawler.pullSubmissionsAt(1, 0, callback);
    };

    return crawler;
};

exports.getUserInfo = function (user_id, callback) {
    var crawler = new SubmissionCrawler(user_id);
    crawler.load(function () {
        crawler.pullSubmissions(callback);
    });
};
