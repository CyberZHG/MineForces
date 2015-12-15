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

function getDefaultSetting() {
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

exports.Setting = function() {
  this.setting = getDefaultSetting();
}

exports.Setting.prototype.setUserSetting = function(user_setting) {
  for (var i = 0; i < KEYS.length; ++i) {
    var key = KEYS[i];
    if (key in user_setting) {
      this.setting[key] = user_setting[key];
    }
  }
}

exports.Setting.prototype.addUser = function(username) {
  if (this.setting[KEY_TEAM].indexOf(username) !== -1) {
    this.setting[KEY_TEAM].push(username);
  }
}

exports.Setting.prototype.setForceUpdate = function() {
  this.setting[KEY_FORCE_UPDATE] = true;
}

exports.Setting.prototype.isAllowAccepted = function() {
  return this.setting[KEY_ACCEPTED];
}

exports.Setting.prototype.getTeam = function() {
  return this.setting[KEY_TEAM];
}

exports.Setting.prototype.getChase = function() {
  return this.setting[KEY_CHASE];
}

exports.Setting.prototype.getSetNum = function() {
  return this.setting[KEY_SET_NUM];
}

exports.Setting.prototype.getProblemNum = function() {
  return this.setting[KEY_PROBLEM_NUM];
}

exports.Setting.prototype.isForceUpdate = function() {
  return this.setting[KEY_FORCE_UPDATE];
}

exports.Setting.prototype.getSolved = function() {
  return this.setting[KEY_SOLVED];
}

exports.Setting.prototype.getTagAccept = function() {
  return this.setting[KEY_TAG_ACCEPT];
}

exports.Setting.prototype.getTagReject = function() {
  return this.setting[KEY_TAG_REJECT];
}

exports.Setting.prototype.getTagRejectIfSingle = function() {
  return this.setting[KEY_TAG_REJECT_IF_SINGLE];
}

exports.Setting.prototype.isTagRejectIfNone = function() {
  return this.setting[KEY_TAG_REJECT_IF_NONE];
}

exports.Setting.prototype.getIdRangeLow = function() {
  return this.setting[KEY_ID_RANGE][0];
}

exports.Setting.prototype.getIdRangeHigh = function() {
  return this.setting[KEY_ID_RANGE][1];
}

exports.Setting.prototype.getIdAccept = function() {
  return this.setting[KEY_ID_ACCEPT];
}

exports.Setting.prototype.isRejectSub = function() {
  return this.setting[KEY_REJECT_SUB];
}
