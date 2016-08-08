/*jslint node: true */
'use strict';
var util = require('./util');

var KEY_TEAM = 'team',
    KEY_CHASE = 'chase',
    KEY_ACCEPTED = 'accepted',
    KEY_SET_NUM = 'set_num',
    KEY_PROBLEM_NUM = 'problem_num',
    KEY_FORCE_UPDATE = 'force_update',
    KEY_SOLVED = 'solved',
    KEY_TAG_ACCEPT = 'tag_accept',
    KEY_TAG_REJECT = 'tag_reject',
    KEY_TAG_REJECT_IF_SINGLE = 'tag_reject_if_single',
    KEY_TAG_REJECT_IF_NONE = 'tag_reject_if_none',
    KEY_ID_RANGE = 'id_range',
    KEY_ID_ALPHA = 'id_alpha',
    KEY_ID_REJECT = 'id_reject',
    KEY_REJECT_SUB = 'reject_sub',
    KEY_ASCII_ONLY = 'ascii_only',
    KEY_SHOW_TEAM_STATUS = 'show_team_status',
    KEY_SILENT = 'silent',
    KEY_SHOW_PROBLEM_DETAIL = 'show_problem_detail',
    KEY_FORCE_NEW_TAG = 'force_new_tag',
    KEY_OUTPUT_PATH = 'output_path';

var TEAM_STATUS_KEY_TOTAL = 'total',
    TEAM_STATUS_KEY_ALPHA = 'alpha',
    TEAM_STATUS_KEY_TAG = 'tag';

var PROBLEM_DETAIL_KEY_TITLE = 'title',
    PROBLEM_DETAIL_KEY_SOLVED = 'solved',
    PROBLEM_DETAIL_KEY_TAG = 'tag';

var KEYS = [KEY_TEAM, KEY_CHASE, KEY_ACCEPTED,
        KEY_SET_NUM, KEY_PROBLEM_NUM, KEY_FORCE_UPDATE, KEY_SOLVED,
        KEY_TAG_ACCEPT, KEY_TAG_REJECT, KEY_TAG_REJECT_IF_SINGLE, KEY_TAG_REJECT_IF_NONE,
        KEY_ID_RANGE, KEY_ID_ALPHA, KEY_ID_REJECT,
        KEY_REJECT_SUB, KEY_ASCII_ONLY, KEY_SHOW_TEAM_STATUS, KEY_SILENT,
        KEY_SHOW_PROBLEM_DETAIL, KEY_FORCE_NEW_TAG, KEY_OUTPUT_PATH];

function getDefaultSetting() {
    var setting = {};
    setting[KEY_TEAM] = [];
    setting[KEY_CHASE] = [];
    setting[KEY_ACCEPTED] = false;
    setting[KEY_SET_NUM] = 10;
    setting[KEY_PROBLEM_NUM] = 5;
    setting[KEY_FORCE_UPDATE] = false;
    setting[KEY_SOLVED] = [5000, 2000, 1000, 500, 100];
    setting[KEY_TAG_ACCEPT] = [];
    setting[KEY_TAG_REJECT] = [];
    setting[KEY_TAG_REJECT_IF_SINGLE] = [];
    setting[KEY_TAG_REJECT_IF_NONE] = false;
    setting[KEY_ID_RANGE] = [0, 100000];
    setting[KEY_ID_ALPHA] = [];
    setting[KEY_ID_REJECT] = [];
    setting[KEY_REJECT_SUB] = false;
    setting[KEY_ASCII_ONLY] = true;
    setting[KEY_SHOW_TEAM_STATUS] = [TEAM_STATUS_KEY_TOTAL];
    setting[KEY_SILENT] = false;
    setting[KEY_SHOW_PROBLEM_DETAIL] = [PROBLEM_DETAIL_KEY_TITLE, PROBLEM_DETAIL_KEY_SOLVED, PROBLEM_DETAIL_KEY_TAG];
    setting[KEY_FORCE_NEW_TAG] = false;
    setting[KEY_OUTPUT_PATH] = '';
    return setting;
}

exports.Setting = function () {
    var setting = getDefaultSetting();

    setting.setUserSetting = function (user_setting) {
        KEYS.forEach(function (key) {
            if (user_setting.hasOwnProperty(key)) {
                setting[key] = user_setting[key];
            }
        });
    };

    setting.addUser = function (username) {
        if (!util.isArray(setting[KEY_TEAM])) {
            if (setting[KEY_TEAM] === '') {
                setting[KEY_TEAM] = [username];
            } else {
                setting[KEY_TEAM] = [setting[KEY_TEAM], username];
            }
        }
        if (setting[KEY_TEAM].indexOf(username) === -1) {
            setting[KEY_TEAM].push(username);
        }
    };

    setting.setForceUpdate = function () {
        setting[KEY_FORCE_UPDATE] = true;
    };

    function extendValue(val, pos) {
        if (util.isArray(val)) {
            if (pos < val.length) {
                return val[pos];
            }
            return null;
        }
        return val;
    }

    function extendArrayValue(val, pos) {
        if (util.isArray(val)) {
            if (val.length === 0 || !util.isArray(val[0])) {
                return val;
            }
            return val[pos];
        }
        return [val];
    }

    setting.getTeam = function () {
        return extendArrayValue(setting[KEY_TEAM]);
    };

    setting.getChase = function () {
        return extendArrayValue(setting[KEY_CHASE]);
    };

    setting.getSetNum = function () {
        return setting[KEY_SET_NUM];
    };

    setting.getProblemNum = function () {
        return setting[KEY_PROBLEM_NUM];
    };

    setting.isForceUpdate = function () {
        return setting[KEY_FORCE_UPDATE];
    };

    setting.isAllowAccepted = function (pos) {
        return extendValue(setting[KEY_ACCEPTED], pos);
    };

    setting.getSolved = function (pos) {
        return extendValue(setting[KEY_SOLVED], pos);
    };

    setting.getTagAccept = function (pos) {
        return extendArrayValue(setting[KEY_TAG_ACCEPT], pos);
    };

    setting.getTagReject = function (pos) {
        return extendArrayValue(setting[KEY_TAG_REJECT], pos);
    };

    setting.getTagRejectIfSingle = function (pos) {
        return extendArrayValue(setting[KEY_TAG_REJECT_IF_SINGLE], pos);
    };

    setting.isTagRejectIfNone = function (pos) {
        return extendValue(setting[KEY_TAG_REJECT_IF_NONE], pos);
    };

    setting.getIdRangeLow = function (pos) {
        return extendArrayValue(setting[KEY_ID_RANGE], pos)[0];
    };

    setting.getIdRangeHigh = function (pos) {
        return extendArrayValue(setting[KEY_ID_RANGE], pos)[1];
    };

    setting.getIdAlpha = function (pos) {
        return extendArrayValue(setting[KEY_ID_ALPHA], pos);
    };

    setting.getIdReject = function (pos) {
        return extendArrayValue(setting[KEY_ID_REJECT], pos);
    };

    setting.isRejectSub = function (pos) {
        return extendValue(setting[KEY_REJECT_SUB], pos);
    };

    setting.isAsciiOnly = function (pos) {
        return extendValue(setting[KEY_ASCII_ONLY], pos);
    };

    setting.getShowTeamStatus = function () {
        return setting[KEY_SHOW_TEAM_STATUS];
    };

    setting.isShowTeamStatus = function () {
        return setting[KEY_SHOW_TEAM_STATUS].length > 0;
    };

    setting.isShowTeamTotal = function () {
        return setting[KEY_SHOW_TEAM_STATUS].indexOf(TEAM_STATUS_KEY_TOTAL) !== -1;
    };

    setting.isShowTeamAlpha = function () {
        return setting[KEY_SHOW_TEAM_STATUS].indexOf(TEAM_STATUS_KEY_ALPHA) !== -1;
    };

    setting.isShowTeamTag = function () {
        return setting[KEY_SHOW_TEAM_STATUS].indexOf(TEAM_STATUS_KEY_TAG) !== -1;
    };

    setting.isSilent = function () {
        return setting[KEY_SILENT];
    };

    setting.getShowProblemDetail = function () {
        return setting[KEY_SHOW_PROBLEM_DETAIL];
    };

    setting.isShowProblemDetail = function () {
        return setting[KEY_SHOW_PROBLEM_DETAIL].length > 0;
    };

    setting.isShowProblemTitle = function () {
        return setting[KEY_SHOW_PROBLEM_DETAIL].indexOf(PROBLEM_DETAIL_KEY_TITLE) !== -1;
    };

    setting.isShowProblemSolved = function () {
        return setting[KEY_SHOW_PROBLEM_DETAIL].indexOf(PROBLEM_DETAIL_KEY_SOLVED) !== -1;
    };

    setting.isShowProblemTag = function () {
        return setting[KEY_SHOW_PROBLEM_DETAIL].indexOf(PROBLEM_DETAIL_KEY_TAG) !== -1;
    };

    setting.setForceNewTag = function () {
        setting[KEY_FORCE_NEW_TAG] = true;
    };

    setting.isForceNewTag = function () {
        return setting[KEY_FORCE_NEW_TAG];
    };

    setting.setOutputPath = function (path) {
        setting[KEY_OUTPUT_PATH] = path;
    };

    setting.getOutputPath = function () {
        return setting[KEY_OUTPUT_PATH];
    };

    setting.isOutput = function () {
        return setting[KEY_OUTPUT_PATH] !== '';
    };

    return setting;
};
