"use strict";

browser = typeof browser === 'undefined' ? chrome : browser;

var log = function() {
    // https://stackoverflow.com/questions/45001489/wrap-a-console-log-with-infinite-optional-params
    return function(...message) {
        console.log(`[${open.name}]`, ...message);
    };
}();
