/*jslint node: true */
'use strict';
exports.getUserHome = function () {
    if (process.platform === 'win32') {
        return process.env.USERPROFILE;
    }
    return process.env.HOME;
};

exports.getSaveDirectory = function () {
    return exports.getUserHome() + '/.mineforces/';
};

exports.newArray = function (length, def) {
    var array = [];
    while (length > 0) {
        array.push(def);
        length -= 1;
    }
    return array;
};

exports.newIncArray = function (length) {
    var array = [],
        inc = 0;
    while (length > 0) {
        array.push(inc);
        length -= 1;
        inc += 1;
    }
    return array;
};

exports.newRangeArray = function (low, high) {
    var array = [];
    while (low <= high) {
        array.push(low);
        low += 1;
    }
    return array;
};

exports.isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};
