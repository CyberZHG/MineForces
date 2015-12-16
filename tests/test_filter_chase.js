/*jslint node: true */
/*global describe: false, it: false */
'use strict';
var assert = require('assert');
var setting = require('../libs/setting');
var filter = require('../libs/filter');

var test_time_out = 1000 * 60 * 10;

describe('Filter', function () {
    describe('#filter_chase', function () {
        it('Chase another user', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': 'cyberzhg',
                'chase': 'tourist',
                'accepted': false,
                'solved': 100000,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets, team_accepts, chase_accepts) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return !team_accepts.hasOwnProperty(problem.id) && chase_accepts.hasOwnProperty(problem.id);
                    });
                }));
                done();
            });
        });
    });
});
