/*jslint node: true */
/*global describe: false, it: false */
'use strict';
var assert = require('assert');
var setting = require('../lib/setting');
var filter = require('../lib/filter');

var test_time_out = 1000 * 60 * 10;

describe('Filter', function () {
    describe('#filter_no_duplicate', function () {
        it('Never return duplicate ids', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting(),
                ids = {},
                num = 0;
            user_setting.setUserSetting({
                'accepted': true,
                'solved': 100000,
                'set_num': 1000,
                'problem_num': 3,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                problem_sets.forEach(function (problem_set) {
                    num += problem_set.length;
                    problem_set.forEach(function (problem) {
                        ids[problem.id] = true;
                    });
                });
                assert.equal(Object.keys(ids).length, num);
                done();
            });
        });
    });
});
