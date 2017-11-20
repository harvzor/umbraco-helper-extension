"use strict";

/**
 * Wraper for notifying the user of anything that's happening.
 */
var notify = function() {
    /**
     * @param {string} message Your message to the user.
     */
    return function(message) {
        browser.notifications.create({
            type: 'basic',
            title: open.name,
            message: message
        });
    };
}();
