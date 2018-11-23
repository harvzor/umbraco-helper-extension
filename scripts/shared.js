"use strict";

/**
 * Shared code between main extension controller and also settings controller.
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
                        resolve('icons/64-orange.png');
                    } else {
                        resolve('icons/64-blue.png');
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
                        64: path
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
        // browser.menus is the new API (FF55), browser.contextMenus works on Chrome and FF
        var menus = browser.menus || browser.contextMenus;

        // Can't check to see if there's a listener because the `hasListener` method has to have a function input,
        // but when I come to checking, it only checks the current instance of this function!
        //menus.onClicked.hasListener(onClickListener)

        /**
         * What happens when the context menu is clicked on.
         * @param {object} info
         * @private
         */
        let onClickListener = (info) => {
            if (info.menuItemId == 'toggle-umbraco') {
                toggleUmbraco();
            } else if (info.menuItemId == 'open-umbraco-backoffice') {
                openUmbracoNode();
            } else if (info.menuItemId.includes('helpful-links-')) {
                let id = info.menuItemId.replace('helpful-links-', '');

                settings.menuLinks.get()
                    .then(text => {
                        let menuLinks = JSON.parse(text);
                        helpers.createTabAfterCurrent(menuLinks[id].link);
                    });
            }
        };

        /**
         * Setup links in the context menu which can be edited by the user.
         * @private
         */
        let setupLinks = function() {
            settings.menuLinks.get()
                .then(text => {
                    let menuLinks = JSON.parse(text);

                    if (!menuLinks.length) {
                        // No menu links have been supplied so the links context items should not be added.
                        return;
                    }

                    // Separator.
                    menus.create({
                        id: 'helpful-links-separator',
                        type: 'separator',
                        contexts: ['all']
                    });

                    // Parent item.
                    menus.create({
                        id: 'helpful-links',
                        title: 'Helpful Links',
                        contexts: ['all']
                    });

                    menuLinks.forEach((menuLink, i) => {
                        menus.create({
                            parentId: 'helpful-links',
                            id: 'helpful-links-' + i,
                            title: menuLink.title,
                            contexts: ['all'],
                            icons: typeof menuLink.icons !== 'undefined'
                                ? menuLink.icons
                                : null
                        });
                    });
                });
        };

        /**
         * Setup the right click context menus.
         * @param {boolean} setupListeners Whether the listeners should be setup.
         */
        var setup = function(setupListeners) {
            if (setupListeners) {
                menus.onClicked.addListener(onClickListener);
            }

            settings.createContextMenu.get()
                .then((createContextMenu) => {
                    menus.removeAll();

                    if (!createContextMenu) {
                        return;
                    }

                    menus.create({
                        id: 'toggle-umbraco',
                        title: 'Toggle Backoffice',
                        contexts: ['all']
                    });

                    menus.create({
                        id: 'open-umbraco-backoffice',
                        title: 'Open Current Page/Node',
                        contexts: ['all']
                    });

                    setupLinks();

                }, (error) => {
                    log(`Error: ${error}`);
                });
        };

        return {
            setup: setup
        };
    }();

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

        Promise.all([
            // Versions after 7.0.0.
            browser.cookies.get({
                url: domain,
                name: 'XSRF-TOKEN'
            }),
            // Versions after and including Umbraco 7.6.6.
            // https://github.com/umbraco/Umbraco-CMS/commit/d300bf8d6db3d6ce4485db0d2ba23566648f0f6b#diff-03b545eb24a942725027983f14c7d436
            browser.cookies.get({
                url: domain,
                name: 'UMB-XSRF-TOKEN'
            })
        ])
        .then((cookies) => {
            if (!cookies[0] && !cookies[1]) {
                notify('Failed to get Umbraco access. Are you logged in?');

                return;
            }

            let headers = new Headers();

            if (cookies[0] != null) {
                headers.append('X-XSRF-TOKEN', cookies[0].value);
            }

            if (cookies[1] != null) {
                headers.append('X-UMB-XSRF-TOKEN', cookies[1].value);
            }

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
