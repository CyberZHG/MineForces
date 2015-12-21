/*jslint node: true */
/*global describe: false, it: false */
'use strict';
var assert = require('assert');
var setting = require('../lib/setting');
var filter = require('../lib/filter');

var test_time_out = 1000 * 60 * 10;

describe('Filter', function () {
    describe('#filter_ascii_only', function () {
        it('Has special character', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'ascii_only': false,
                'set_num': 1,
                'problem_num': 2,
                'id_range': [524, 524],
                'id_alpha': ['A', 'B'],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.equal(problem_sets.length, 1);
                assert.equal(problem_sets[0].length, 2);
                done();
            });
        });

        it('No special character', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'ascii_only': true,
                'set_num': 1,
                'problem_num': 2,
                'id_range': [524, 524],
                'id_alpha': ['A', 'B'],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.equal(problem_sets.length, 1);
                assert.equal(problem_sets[0].length, 0);
                done();
            });
        });
    });
});
