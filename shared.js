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

    /**
     * Setup right click context menus.
     * This has to be ran (as in `var contextMenus = contextMenus()`)
     * to be useable, because if it is ran here, then while the user is looking
     * at the options page, two sets of menu click events will trigger.
     */
    var contextMenus = function() {
        // I had trouble removing the listener, so I'll just add it once
        // even if there's new context menu.
        browser.menus.onClicked.addListener((info, tab) => {
            if (info.menuItemId == 'toggle-umbraco') {
                toggleUmbraco();
            } else if (info.menuItemId == 'open-umbraco-backoffice') {
                openUmbracoNode();
            }
        });

        var setup = function() {
            browser.storage.local.get('contextMenu')
                .then((result) => {
                    if (!result.contextMenu) {
                        browser.menus.removeAll();

                        return;
                    } 

                    browser.menus.create({
                        id: 'toggle-umbraco',
                        title: 'Toggle Backoffice',
                        contexts: ['all']
                    });

                    browser.menus.create({
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
        let origin = helpers.getOrigin(url.get());

        helpers.createTabAfterCurrent(
            url.get().includes('/umbraco')
                ? origin // Navigate back to the homepage since we are in Umbraco.
                : origin + '/umbraco/' // Must have trailing slash for Umbraco 4.
        );
    };

    /**
     * 
     * @param {string} useUrl 
     */
    let openUmbracoNode = (useUrl = url.get()) => {
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

    /**
     * @private
     */
    let url = function() {
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

    return {
        delay: delay,
        setIcon: setIcon,
        contextMenus: contextMenus,
        toggleUmbraco: toggleUmbraco,
        openUmbracoNode: openUmbracoNode,
        url: url
    };
}();
