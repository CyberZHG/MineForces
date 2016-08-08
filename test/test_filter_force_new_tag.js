/*jslint node: true */
/*global describe: false, it: false */
'use strict';
var assert = require('assert');
var setting = require('../lib/setting');
var filter = require('../lib/filter');

var test_time_out = 1000 * 60 * 10;

describe('Filter', function () {
    describe('#filter_force_new_tag', function () {
        it('Force new tag', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'force_new_tag': true,
                'solved': 100000,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    var tags = {};
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        var result = problem.tags.some(function (tag) {
                            return !tags.hasOwnProperty(tag);
                        });
                        problem.tags.forEach(function (tag) {
                            tags[tag] = true;
                        });
                        return result;
                    });
                }));
                done();
            });
        });

        it('Not force new tag', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'force_new_tag': false,
                'solved': 100000,
                'problem_num': 20,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    var tags = {};
                    assert.ok(problem_set.length > 0);
                    return problem_set.some(function (problem) {
                        var result = problem.tags.some(function (tag) {
                            return tags.hasOwnProperty(tag);
                        });
                        problem.tags.forEach(function (tag) {
                            tags[tag] = true;
                        });
                        return result;
                    });
                }));
                done();
            });
        });
    });
});
