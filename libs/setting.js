const KEY_ACCEPTED             = "accepted";
const KEY_TEAM                 = "team";
const KEY_CHASE                = "chase";
const KEY_SET_NUM              = "set_num";
const KEY_PROBLEM_NUM          = "problem_num";
const KEY_FORCE_UPDATE         = "force_update";
const KEY_SOLVED               = "solved";
const KEY_TAG_ACCEPT           = "tag_accept";
const KEY_TAG_REJECT           = "tag_reject";
const KEY_TAG_REJECT_IF_SINGLE = "tag_reject_if_single";
const KEY_TAG_REJECT_IF_NONE   = "tag_reject_if_none";
const KEY_ID_RANGE             = "id_range";
const KEY_ID_ACCEPT            = "id_accept";
const KEY_REJECT_SUB           = "reject_sub";

const KEYS = [KEY_ACCEPTED, KEY_TEAM, KEY_CHASE, 
              KEY_SET_NUM, KEY_PROBLEM_NUM, KEY_FORCE_UPDATE, KEY_SOLVED,
              KEY_TAG_ACCEPT, KEY_TAG_REJECT, KEY_TAG_REJECT_IF_SINGLE, KEY_TAG_REJECT_IF_NONE];

exports.getDefaultSetting = function() {
  var setting = {};
  setting[KEY_ACCEPTED]             = false;
  setting[KEY_TEAM]                 = [];
  setting[KEY_CHASE]                = [];
  setting[KEY_SET_NUM]              = 10;
  setting[KEY_PROBLEM_NUM]          = 5;
  setting[KEY_FORCE_UPDATE]         = false;
  setting[KEY_SOLVED]               = [5000, 2000, 1000, 500, 100];
  setting[KEY_TAG_ACCEPT]           = [];
  setting[KEY_TAG_REJECT]           = [];
  setting[KEY_TAG_REJECT_IF_SINGLE] = [];
  setting[KEY_TAG_REJECT_IF_NONE]   = false;
  setting[KEY_ID_RANGE]             = [0, 100000];
  setting[KEY_ID_ACCEPT]            = [];
  setting[KEY_REJECT_SUB]           = false;
  return setting;
}

exports.getUserSetting = function(user_setting) {
  var setting = exports.getDefaultSetting();
  for (var i = 0; i < KEYS.length; ++i) {
    var key = KEYS[i];
    if (key in user_setting) {
      setting[key] = user_setting[key];
    }
  }
  return setting;
}

exports.addUser = function(user_setting, username) {
  if (user_setting[KEY_TEAM].indexOf(username) !== -1) {
    user_setting[KEY_TEAM].push(username);
  }
  return user_setting;
}

exports.setForceUpdate = function(user_setting) {
  user_setting[KEY_FORCE_UPDATE] = true;
  return user_setting;
}

exports.isAllowAccepted = function(setting) {
  return setting[KEY_ACCEPTED];
}

exports.getTeam = function(setting) {
  return setting[KEY_TEAM];
}

exports.getChase = function(setting) {
  return setting[KEY_CHASE];
}

exports.getSetNum = function(setting) {
  return setting[KEY_SET_NUM];
}

exports.getProblemNum = function(setting) {
  return setting[KEY_PROBLEM_NUM];
}

exports.isForceUpdate = function(setting) {
  return setting[KEY_FORCE_UPDATE];
}

exports.getSolved = function(setting) {
  return setting[KEY_SOLVED];
}

exports.getTagAccept = function(setting) {
  return setting[KEY_TAG_ACCEPT];
}

exports.getTagReject = function(setting) {
  return setting[KEY_TAG_REJECT];
}

exports.getTagRejectIfSingle = function(setting) {
  return setting[KEY_TAG_REJECT_IF_SINGLE];
}

exports.isTagRejectIfNone = function(setting) {
  return setting[KEY_TAG_REJECT_IF_NONE];
}

exports.getIdRangeLow = function(setting) {
  return setting[KEY_ID_RANGE][0];
}

exports.getIdRangeHigh = function(setting) {
  return setting[KEY_ID_RANGE][1];
}

exports.getIdAccept = function(setting) {
  return setting[KEY_ID_ACCEPT];
}

exports.isRejectSub = function(setting) {
  return setting[KEY_REJECT_SUB];
}
