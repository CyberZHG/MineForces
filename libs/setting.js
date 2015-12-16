/*jslint node: true */
'use strict';
var util = require('./util');

var KEY_TEAM = "team";
var KEY_CHASE = "chase";
var KEY_ACCEPTED = "accepted";
var KEY_SET_NUM = "set_num";
var KEY_PROBLEM_NUM = "problem_num";
var KEY_FORCE_UPDATE = "force_update";
var KEY_SOLVED = "solved";
var KEY_TAG_ACCEPT = "tag_accept";
var KEY_TAG_REJECT = "tag_reject";
var KEY_TAG_REJECT_IF_SINGLE = "tag_reject_if_single";
var KEY_TAG_REJECT_IF_NONE = "tag_reject_if_none";
var KEY_ID_RANGE = "id_range";
var KEY_ID_ALPHA = "id_alpha";
var KEY_REJECT_SUB = "reject_sub";
var KEY_SILENT = "silent";

var KEYS = [KEY_TEAM, KEY_CHASE, KEY_ACCEPTED,
        KEY_SET_NUM, KEY_PROBLEM_NUM, KEY_FORCE_UPDATE, KEY_SOLVED,
        KEY_TAG_ACCEPT, KEY_TAG_REJECT, KEY_TAG_REJECT_IF_SINGLE, KEY_TAG_REJECT_IF_NONE,
        KEY_ID_RANGE, KEY_ID_ALPHA, KEY_REJECT_SUB, KEY_SILENT];

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
    setting[KEY_REJECT_SUB] = false;
    setting[KEY_SILENT] = false;
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
        if (setting[KEY_TEAM].indexOf(username) !== -1) {
            setting[KEY_TEAM].push(username);
        }
    };

    setting.setForceUpdate = function () {
        setting[KEY_FORCE_UPDATE] = true;
    };

    setting.getTeam = function () {
        return setting[KEY_TEAM];
    };

    setting.getChase = function () {
        return setting[KEY_CHASE];
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

    function extendValue(val, pos) {
        if (util.isArray(val)) {
            return val[pos];
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

    setting.isRejectSub = function (pos) {
        return extendValue(setting[KEY_REJECT_SUB], pos);
    };

    setting.isSilent = function () {
        return setting[KEY_SILENT];
    };

    return setting;
};
