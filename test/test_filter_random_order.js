/*jslint node: true */
/*global describe: false, it: false */
'use strict';
var assert = require('assert');
var setting = require('../lib/setting');
var filter = require('../lib/filter');

var test_time_out = 1000 * 60 * 10;

describe('Filter', function () {
    describe('#filter_random_order', function () {
        it('Force new tag', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'solved': 100000,
                'problem_num': 100,
                'random_order': true,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.some(function (problem, idx) {
                        if (idx === 0) {
                            return false;
                        }
                        return problem.solved > problem_set[idx - 1].solved;
                    });
                }));
                done();
            });
        });
    });
});
