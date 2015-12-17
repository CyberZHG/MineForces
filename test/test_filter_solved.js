/*jslint node: true */
/*global describe: false, it: false */
'use strict';
var assert = require('assert');
var setting = require('../lib/setting');
var filter = require('../lib/filter');

var test_time_out = 1000 * 60 * 10;

describe('Filter', function () {
    describe('#filter_solved', function () {
        it('Given const number', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'solved': 500,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return problem.solved <= 500;
                    });
                }));
                done();
            });
        });

        it('Given an array', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'problem_num': 2,
                'solved': [10000, 100],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.equal(problem_set.length, 2);
                    return problem_set[0].solved <= 10000 && problem_set[1].solved <= 100;
                }));
                assert.ok(problem_sets.some(function (problem_set) {
                    return problem_set[0].solved > 100;
                }));
                done();
            });
        });
    });
});
