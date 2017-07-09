"use strict";

browser = typeof browser === 'undefined' ? chrome : browser;

var log = function() {
    return function(...message) {
        console.log(`[${open.name}]`, message);
    };
}();

