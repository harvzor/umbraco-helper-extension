"use strict";

browser = typeof browser === 'undefined' ? chrome : browser;

/**
 * Shared code between modules.
 */
var shared = function() {
    /**
     * For getting and setting the delay between when the extension
     * icon is clicked and either the single or double click action
     * occurs.
     */
    let delay = function() {
        let value = 300;

        let getNew = () => {
            browser.storage.local.get('delay')
                .then((result) => {
                    value = Object.keys(result).length ? result.delay : 300;
                }, (error) => {
                    log(`Error: ${error}`);
                });
        };

        // We have to watch for changes because shared is not a
        // singleton between the main process and the options!
        browser.storage.onChanged.addListener((change, area) => {
            if (area !== 'local') {
                return;
            }

            getNew();
        });

        /**
         * Get the delay time (ms).
         */
        let get = () => {
            return value;
        };

        /**
         * Set the delay time (ms).
         * @param {number} newValue New delay time (ms).
         */
        let set = (newValue) => {
            value = newValue;
        };

        getNew();

        return {
            get: get,
            set: set
        };
    }();

    /**
     * Set the web extension icon in the browser chrome.
     */
    let setIcon = () => {
        browser.storage.local.get('altLogo')
            .then((result) => {
                if (result.altLogo) {
                    browser.browserAction.setIcon({
                        path: {
                            48: 'icons/48-orange.png'
                        }
                    });
                } else {
                    browser.browserAction.setIcon({
                        path: {
                            30: 'icons/30-blue.png'
                        }
                    });
                }
            }, (error) => {
                log(`Error: ${error}`);
            });
    };

    return {
        setIcon: setIcon,
        delay: delay
    };
}();
