/*jslint node: true */
'use strict';
var chalk = require('chalk');
var Table = require('cli-table');

exports.showStatus = function (setting, problems, team_accepts) {
    var totalSolved = Object.keys(team_accepts).length,
        totalNum = Object.keys(problems).length,
        tagSolved = {},
        tagTotal = {},
        alphaSolved = {},
        alphaTotal = {},
        alphaList = [],
        table;
    if (setting.isShowTeamTotal()) {
        console.log(chalk.green("Total: " + totalSolved + " / " + totalNum));
    }
    if (setting.isShowTeamAlpha() || setting.isShowTeamTag()) {
        Object.keys(team_accepts).forEach(function (key) {
            problems[key].tags.forEach(function (tag) {
                if (tagSolved.hasOwnProperty(tag)) {
                    tagSolved[tag] += 1;
                } else {
                    tagSolved[tag] = 1;
                }
            });
            if (alphaSolved.hasOwnProperty(problems[key].alpha[0])) {
                alphaSolved[problems[key].alpha[0]] += 1;
            } else {
                alphaSolved[problems[key].alpha[0]] = 1;
            }
        });
        Object.keys(problems).forEach(function (key) {
            problems[key].tags.forEach(function (tag) {
                if (tagTotal.hasOwnProperty(tag)) {
                    tagTotal[tag] += 1;
                } else {
                    tagTotal[tag] = 1;
                }
            });
            if (alphaTotal.hasOwnProperty(problems[key].alpha[0])) {
                alphaTotal[problems[key].alpha[0]] += 1;
            } else {
                alphaTotal[problems[key].alpha[0]] = 1;
            }
        });
    }
    if (setting.isShowTeamAlpha()) {
        console.log();
        table = new Table({
            head: ['Alpha', 'Solved', 'Total'],
            chars: {'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
                'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
                'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
                'right': '', 'right-mid': '', 'middle': ' '},
            style: { 'padding-left': 1, 'padding-right': 1 }
        });
        alphaList = Object.keys(alphaTotal);
        alphaList.sort();
        alphaList.forEach(function (alpha) {
            if (!alphaSolved.hasOwnProperty(alpha)) {
                alphaSolved[alpha] = 0;
            }
            table.push([alpha, alphaSolved[alpha], alphaTotal[alpha]]);
        });
        console.log(table.toString());
    }
    if (setting.isShowTeamTag()) {
        console.log();
        table = new Table({
            head: ['Tag', 'Solved', 'Total'],
            chars: {'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
                'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
                'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
                'right': '', 'right-mid': '', 'middle': ' '},
            style: { 'padding-left': 1, 'padding-right': 1 }
        });
        Object.keys(tagTotal).forEach(function (tag) {
            if (!tagSolved.hasOwnProperty(tag)) {
                tagSolved[tag] = 0;
            }
            table.push([tag, tagSolved[tag], tagTotal[tag]]);
        });
        console.log(table.toString());
    }
};
