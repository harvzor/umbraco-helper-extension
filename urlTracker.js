"use strict";

browser = typeof browser === 'undefined' ? chrome : browser;

/**
 * Tracks the current URL which the user is looking at.
 * Required because Firefox isn't good at knowing what a tab is loading,
 * but we still want to know what URL the user is loading before a tab
 * has loaded.
 */
let urlTracker = function() {
    let currentUrl = '';

    let set = (newUrl) => {
        currentUrl = newUrl;

        log(currentUrl);
    };

    let get = () => {
        return currentUrl;
    };

    // Check to see if the current URL is a valid website URL, and not some internal browser page.
    let valid = () => {
        return get().startsWith('http');
    };

    // Events.
    (function() {
        browser.webNavigation.onBeforeNavigate.addListener((details) => {
            if (details.frameId == 0) {
                set(details.url);
            }
        });

        browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
            if (changeInfo.url) {
                set(changeInfo.url);
            }
        });

        browser.tabs.onActivated.addListener((activeInfo) => {
            browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
                set(tabs[0].url);
            });
        });
    }());

    return {
        get: get,
        valid: valid
    };
}();
