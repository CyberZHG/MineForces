#!/usr/bin/env node
/*jslint node: true*/
'use strict';
var fs = require('fs');
var util = require('./util');

var saveDirectory = util.getSaveDirectory();
fs.exists(saveDirectory, function (exists) {
    if (!exists) {
        fs.mkdir(saveDirectory, function (err) {
            if (err) {
                throw err;
            }
        });
    }
});
