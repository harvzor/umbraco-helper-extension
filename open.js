"use strict";

browser = typeof browser === 'undefined' ? chrome : browser;

var open = function() {
    let clickTimeout = null;

    let url = function() {
        let currentUrl = '';

        let set = (newUrl) => {
            currentUrl = newUrl;

            console.log(currentUrl);
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

    let toggleUmbraco = () => {
        let origin = helpers.getOrigin(url.get());

        helpers.createTabAfterCurrent(
            url.get().includes('/umbraco')
                ? origin // Navigate back to the homepage since we are in Umbraco.
                : origin + '/umbraco/' // Must have trailing slash for Umbraco 4.
        );
    };

    let openUmbracoNode = () => {
        let apiUrl = '/umbraco/backoffice/UmbracoApi/Entity/SearchAll?query=';
        let path = helpers.getPath(url.get());
        let alias = helpers.getAliasOfPath(path);
        let domain = helpers.getOrigin(url.get());

        browser.cookies.get({
            url: domain,
            name: 'XSRF-TOKEN'
        })
        .then((cookie) => {
            let headers = new Headers({
                'X-XSRF-TOKEN': cookie.value
            });

            fetch(domain + apiUrl + alias, {
                method: 'GET',
                credentials: 'same-origin',
                headers: headers
            })
            .then((response) => {
                response.text().then((text) => {
                    let json = JSON.parse(helpers.decruft(text));

                    helpers.createTabAfterCurrent(domain + '/umbraco/#/content/content/edit/' + json[0].results[0].id);
                });
            })
            .catch((error) => {
                console.log('error', error);
            });
        });
    };

    // The button click event.
    // Also tracks if the user has clicked or double clicked.
    // - single click: toggle Umbraco
    // - double click: open Umbraco node
    let clickEvent = (e) => {
        if (!url.valid()) {
            console.log('Not a valid URL.');

            return;
        }

        if (clickTimeout != null) {
            clearTimeout(clickTimeout);

            clickTimeout = null;

            openUmbracoNode();
        } else {
            clickTimeout = setTimeout(() => {
                toggleUmbraco();

                clearTimeout(clickTimeout);

                clickTimeout = null;
            }, 300);
        }
    };

    browser.browserAction.onClicked.addListener(clickEvent);
    shared.setIcon();

    return {
        name: 'UmbracoOpen',
        version: '0.6.0',
        toggleUmbraco: toggleUmbraco,
        openUmbracoNode: openUmbracoNode
    };
}();

