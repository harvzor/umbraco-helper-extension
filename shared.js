"use strict";

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
            browser.storage.sync.get('delay')
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
        browser.storage.sync.get('altLogo')
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

    /**
     * Setup right click context menus.
     * This has to be ran (as in `var contextMenus = contextMenus()`)
     * to be useable, because if it is ran here, then while the user is looking
     * at the options page, two sets of menu click events will trigger.
     */
    var contextMenus = function() {
        // Required until the polyfill catches up: https://github.com/mozilla/webextension-polyfill/issues/74
        var menus = browser.menus || browser.contextMenus;

        // I had trouble removing the listener, so I'll just add it once
        // even if there's new context menu.
        menus.onClicked.addListener((info, tab) => {
            if (info.menuItemId == 'toggle-umbraco') {
                toggleUmbraco();
            } else if (info.menuItemId == 'open-umbraco-backoffice') {
                openUmbracoNode();
            }
        });

        var setup = function() {
            browser.storage.sync.get('contextMenu')
                .then((result) => {
                    if (!result.contextMenu) {
                        menus.removeAll();

                        return;
                    }

                    menus.create({
                        id: 'toggle-umbraco',
                        title: 'Toggle Backoffice',
                        contexts: ['all']
                    });

                    menus.create({
                        id: 'open-umbraco-backoffice',
                        title: 'Open Node',
                        contexts: ['all']
                    });

                }, (error) => {
                    log(`Error: ${error}`);
                });
        };

        return {
            setup: setup
        };
    };

    /**
     * If you're on /umbraco/, then open up the site root.
     * If you're not on /umbraco/, open /umbraco/.
     */
    let toggleUmbraco = () => {
        let origin = helpers.getOrigin(urlTracker.get());

        if (urlTracker.get().includes('/umbraco')) {
            // Navigate back to the homepage since we are in Umbraco.
            helpers.createTabBeforeCurrent(origin);
        } else {
            // Must have trailing slash for Umbraco 4.
            helpers.createTabAfterCurrent(origin + '/umbraco/');
        }
    };

    /**
     *
     * @param {string} useUrl
     */
    let openUmbracoNode = (useUrl = urlTracker.get()) => {
        let path = helpers.getPath(useUrl);
        let alias = helpers.getAliasOfPath(path);
        let domain = helpers.getOrigin(useUrl);

        if (path.includes('/umbraco')) {
            notify("Can't find the Umbraco node of a backoffice page!");

            return;
        }

        browser.cookies.get({
            url: domain,
            name: 'XSRF-TOKEN'
        })
        .then((cookie) => {
            if (!cookie) {
                notify('Failed to get Umbraco access. Are you logged in?');

                return;
            }

            let headers = new Headers({
                'X-XSRF-TOKEN': cookie.value
            });

            fetch(domain + '/umbraco/backoffice/UmbracoApi/Entity/SearchAll?query=' + alias, {
                method: 'GET',
                credentials: 'same-origin',
                headers: headers
            })
            .then((response) => {
                response.text().then((text) => {
                    let json = JSON.parse(helpers.decruft(text));

                    let id = helpers.getUmbracoId(json, domain, path);

                    if (id == null) {
                        notify('Failed to find Umbraco node.');

                        return;
                    }

                    helpers.createTabAfterCurrent(domain + '/umbraco/#/content/content/edit/' + id);
                });
            })
            .catch((error) => {
                log('error', error);
            });
        });
    };

    return {
        delay: delay,
        setIcon: setIcon,
        contextMenus: contextMenus,
        toggleUmbraco: toggleUmbraco,
        openUmbracoNode: openUmbracoNode
    };
}();
