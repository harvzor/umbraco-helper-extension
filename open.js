"use strict";

browser = typeof browser === 'undefined' ? chrome : browser;

/**
 * Main extension code.
 */
var open = function() {
    let clickTimeout = null;
    let delay = 300;

    /**
     * The button click event.
     * Also tracks if the user has clicked or double clicked.
     * - single click: toggle Umbraco
     * - double click: open Umbraco node
     * @private
     */
    let clickEvent = () => {
        if (!shared.url.valid()) {
            log('Not a valid URL.');

            return;
        }

        if (clickTimeout != null) {
            clearTimeout(clickTimeout);

            clickTimeout = null;

            shared.openUmbracoNode();
        } else {
            clickTimeout = setTimeout(() => {
                shared.toggleUmbraco();

                clearTimeout(clickTimeout);

                clickTimeout = null;
            }, shared.delay.get());
        }
    };

    browser.browserAction.onClicked.addListener(clickEvent);
    shared.setIcon();
    shared.contextMenus().setup();

    return {
        name: 'UmbracoOpen',
        version: '0.7.0'
    };
}();
