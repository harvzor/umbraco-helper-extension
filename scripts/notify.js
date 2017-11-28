"use strict";

/**
 * Wrapper for notifying the user of anything that's happening.
 */
var notify = function() {
    /**
     * @param {string} message Your message to the user.
     */
    return function(message) {
        var notificationOptions = {
            type: 'basic',
            title: main.name,
            message: message
        };

        shared.getIcon()
            .then((path) => {
                notificationOptions.iconUrl = path;
            })
            .catch(() => {
                log('Error showing notification with iconUrl.');
            })
            .then(() => {
                browser.notifications.create(notificationOptions);
            })
    };
}();
