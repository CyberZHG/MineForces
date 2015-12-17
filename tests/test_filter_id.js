/*jslint node: true */
/*global describe: false, it: false */
'use strict';
var assert = require('assert');
var setting = require('../libs/setting');
var filter = require('../libs/filter');

var test_time_out = 1000 * 60 * 10;

function getLastCharacter(id) {
    return id[id.length - 1];
}

function isNumber(ch) {
    return '0' <= ch && ch <= '9';
}

function getAlpha(id) {
    if (isNumber(getLastCharacter(id))) {
        return id[id.length - 2];
    }
    return getLastCharacter(id);
}

describe('Filter', function () {
    describe('#filter_id_range', function () {
        it('Given const range', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'accept': true,
                'id_range': [100, 200],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        var num = parseInt(problem.id, 10);
                        return 100 <= num && num <= 200;
                    });
                }));
                done();
            });
        });

        it('Given an array of ranges', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'accept': true,
                'problem_num': 2,
                'id_range': [[100, 200], [300, 400]],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.equal(problem_set.length, 2);
                    var num1 = parseInt(problem_set[0].id, 10),
                        num2 = parseInt(problem_set[1].id, 10);
                    return 100 <= num1 && num1 <= 200 && 300 <= num2 && num2 <= 400;
                }));
                done();
            });
        });
    });

    describe('#filter_id_alpha', function () {
        it('Given const alpha', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'accept': true,
                'id_alpha': 'E',
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return getAlpha(problem.id) === 'E';
                    });
                }));
                done();
            });
        });

        it('Given multiple const alpha', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'accept': true,
                'id_alpha': ['D', 'E'],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        var alpha = getAlpha(problem.id);
                        return alpha === 'D' || alpha === 'E';
                    });
                }));
                done();
            });
        });

        it('Given an array of alpha', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'accept': true,
                'problem_num': 5,
                'id_alpha': [['A'], ['B'], ['C'], ['D'], ['E']],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.equal(problem_set.length, 5);
                    return getAlpha(problem_set[0].id) === 'A' &&
                        getAlpha(problem_set[1].id) === 'B' &&
                        getAlpha(problem_set[2].id) === 'C' &&
                        getAlpha(problem_set[3].id) === 'D' &&
                        getAlpha(problem_set[4].id) === 'E';
                }));
                done();
            });
        });
    });

    describe('#filter_id_reject', function () {
        it('Reject specific id', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'accept': true,
                'set_num': 50,
                'id_reject': '1A',
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return problem.id !== '1A';
                    });
                }));
                done();
            });
        });

        it('Reject specific id', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'accept': true,
                'set_num': 50,
                'id_reject': ['1A'],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return problem.id !== '1A';
                    });
                }));
                done();
            });
        });
    });

    describe('#filter_reject_sub', function () {
        it('Given const reject sub', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'accept': true,
                'set_num': 50,
                'reject_sub': true,
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.ok(problem_set.length > 0);
                    return problem_set.every(function (problem) {
                        return !isNumber(getLastCharacter(problem.id));
                    });
                }));
                done();
            });
        });

        it('Given an array of reject sub', function (done) {
            this.timeout(test_time_out);
            var user_setting = new setting.Setting();
            user_setting.setUserSetting({
                'team': ['cyberzhg'],
                'accept': true,
                'set_num': 50,
                'problem_num': 2,
                'reject_sub': [false, true],
                'silent': true
            });
            filter.getFilteredProblemSets(user_setting, function (problem_sets) {
                assert.ok(problem_sets.length > 0);
                assert.ok(problem_sets.every(function (problem_set) {
                    assert.equal(problem_set.length, 2);
                    return !isNumber(getLastCharacter(problem_set[1].id));
                }));
                done();
            });
        });
    });
});
