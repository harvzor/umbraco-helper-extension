"use strict";

/**
 * Wrapper for notifying the user of anything that's happening.
 */
var notify = function() {
    let name = '';

    helpers.getConfig()
        .then(config => {
            name = config.name;
        });

    /**
     * @param {string} message Your message to the user.
     */
    return function(message) {
        if (message === null) {
            log('No message supplied notify.');
        }

        var notificationOptions = {
            type: 'basic',
            title: name,
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
