"use strict";

/**
 * Shared code between modules.
 */
var shared = function() {
    /**
     * Get the icon which should be used.
     */
    let getIcon = () => {
        return new Promise((resolve, reject) => {
            settings.useAltLogo.get()
                .then((useAltLogo) => {
                    if (useAltLogo) {
                        resolve('icons/48-orange.png');
                    } else {
                        resolve('icons/30-blue.png');
                    }
                });
            });
    };

    /**
     * Set the web extension icon in the browser chrome.
     */
    let setIcon = () => {
        getIcon()
            .then((path) => {
                browser.browserAction.setIcon({
                    path: {
                        48: path
                    }
                })
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
            settings.createContextMenu.get()
                .then((createContextMenu) => {
                    if (!createContextMenu) {
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
        getIcon: getIcon,
        setIcon: setIcon,
        contextMenus: contextMenus,
        toggleUmbraco: toggleUmbraco,
        openUmbracoNode: openUmbracoNode
    };
}();
