/*jslint node: true */
/*global describe: false, it: false */
'use strict';
var assert = require('assert');
var setting = require('../libs/setting');
var filter = require('../libs/filter');

var test_time_out = 1000 * 60 * 10;

describe('Filter', function () {
    describe('#filter_accept', function () {
        it('No accepted problems should be returned', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'accepted': false,
                'solved': 100000,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets, team_accepts) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return !team_accepts.hasOwnProperty(problem.id);
                    });
                }));
                done();
            });
        });

        it('Some accepted problems should be returned', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'accepted': true,
                'solved': 100000,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets, team_accepts) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.some(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.some(function (problem) {
                        return team_accepts.hasOwnProperty(problem.id);
                    });
                }));
                done();
            });
        });

        it('Given an array value', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'problem_num': 2,
                'accepted': [true, false],
                'solved': 100000,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets, team_accepts) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.some(function (problem_set) {
                    assert.equal(problem_set.length, 2);
                    return team_accepts.hasOwnProperty(problem_set[0].id);
                }));
                assert.ok(problem_sets.every(function (problem_set) {
                    return !team_accepts.hasOwnProperty(problem_set[1].id);
                }));
                done();
            });
        });
    });
});
