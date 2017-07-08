"use strict";

browser = typeof browser === 'undefined' ? chrome : browser;

var notify = function() {
    return function(message) {
        browser.notifications.create({
            type: 'basic',
            title: open.name,
            message: message
        });
    };
}();

