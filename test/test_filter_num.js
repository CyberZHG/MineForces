/*jslint node: true */
/*global describe: false, it: false */
'use strict';
var assert = require('assert');
var setting = require('../lib/setting');
var filter = require('../lib/filter');

var test_time_out = 1000 * 60 * 10;

describe('Filter', function () {
    describe('#filter_num', function () {
        it('Set number of suites and number of problems', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'accept': true,
                'set_num': 5,
                'problem_num': 3,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.equal(problem_sets.length, 5);
                assert.ok(problem_sets.every(function (problem_set) {
                    return problem_set.length === 3;
                }));
                done();
            });
        });
    });
});
