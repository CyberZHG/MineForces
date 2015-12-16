/*jslint node: true */
/*global describe: false, it: false */
'use strict';
var assert = require('assert');
var setting = require('../libs/setting');
var filter = require('../libs/filter');

var test_time_out = 1000 * 60 * 10;

describe('Filter', function () {
    describe('#filter_tag_accept', function () {
        it('Given const accept tag', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'tag_accept': 'greedy',
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return problem.tags.indexOf('greedy') !== -1;
                    });
                }));
                done();
            });
        });

        it('Given const accept tags', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'tag_accept': ['greedy', 'implementation'],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return problem.tags.some(function (tag) {
                            return ['greedy', 'implementation'].indexOf(tag) !== -1;
                        });
                    });
                }));
                done();
            });
        });

        it('Given an array of accept tags', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'problem_num': 2,
                'tag_accept': [['greedy'], ['implementation']],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.equal(problem_set.length, 2);
                    return problem_set[0].tags.indexOf('greedy') !== -1 &&
                        problem_set[1].tags.indexOf('implementation') !== -1;
                }));
                done();
            });
        });
    });

    describe('#filter_tag_reject', function () {
        it('Given const reject tag', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'tag_reject': 'greedy',
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return problem.tags.indexOf('greedy') === -1;
                    });
                }));
                done();
            });
        });

        it('Given const reject tags', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'tag_reject': ['greedy', 'implementation'],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return problem.tags.every(function (tag) {
                            return ['greedy', 'implementation'].indexOf(tag) === -1;
                        });
                    });
                }));
                done();
            });
        });

        it('Given an array of reject tags', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'set_num': 50,
                'problem_num': 2,
                'tag_reject': [['greedy'], ['implementation']],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.equal(problem_set.length, 2);
                    return problem_set[0].tags.indexOf('greedy') === -1 &&
                        problem_set[1].tags.indexOf('implementation') === -1;
                }));
                done();
            });
        });
    });

    describe('#filter_tag_reject_if_single', function () {
        it('Given const reject tag', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'set_num': 50,
                'tag_reject_if_single': 'greedy',
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return problem.tags.length !== 1 || problem.tags.indexOf('greedy') === -1;
                    });
                }));
                done();
            });
        });

        it('Given const reject tags', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'set_num': 50,
                'tag_reject_if_single': ['greedy', 'implementation'],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return problem.tags.length !== 1 || problem.tags.every(function (tag) {
                            return ['greedy', 'implementation'].indexOf(tag) === -1;
                        });
                    });
                }));
                done();
            });
        });

        it('Given an array of reject tags', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'set_num': 50,
                'problem_num': 2,
                'tag_reject_if_single': [['greedy'], ['implementation']],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.equal(problem_set.length, 2);
                    return (problem_set[0].tags.length !== 1 || problem_set[0].tags.indexOf('greedy') === -1) &&
                        (problem_set[1].tags.length !== 1 || problem_set[1].tags.indexOf('implementation') === -1);
                }));
                done();
            });
        });
    });

    describe('#filter_tag_reject_if_none', function () {
        it('Given const value', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'set_num': 50,
                'solved': 100000,
                'tag_reject_if_none': true,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return problem.tags.length > 0;
                    });
                }));
                done();
            });
        });

        it('Given an array of values', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'set_num': 50,
                'solved': 100000,
                'problem_num': 2,
                'tag_reject_if_none': [false, true],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.equal(problem_set.length, 2);
                    return problem_set[1].tags.length > 0;
                }));
                done();
            });
        });
    });
});
