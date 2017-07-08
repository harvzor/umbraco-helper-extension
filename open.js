browser = typeof browser === 'undefined' ? chrome : browser;

var open = function() {
    let currentUrl = '';
    let clickTimeout = null;

    let decruft = (text) => {
        return text.replace(")]}',", '');
    };

    // Get an Umbraco safe alias from a path.
    let getAliasOfPath = (path) => {
        return path
            .replace('/', ' ')
            .replace('-', ' ');
    };

    let trackUrl = function() {
        browser.webNavigation.onBeforeNavigate.addListener((details) => {
            if (details.frameId == 0) {
                currentUrl = details.url;
            }
        });

        browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
            if (changeInfo.url) {
                currentUrl = changeInfo.url;
            }

            console.log(currentUrl);

        });

        browser.tabs.onActivated.addListener((activeInfo) => {
            browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
                let tab = tabs[0];

                currentUrl = tab.url;

                console.log(currentUrl);
            });
        });
    }();

    // Create an anchor element to get the URL origin.
    // http://stackoverflow.com/a/1421037
    let getOrigin = (fullUrl) => {
        let a = document.createElement('a');
        a.href = fullUrl;

        return a.origin;
    };

    // Get path of a URL.
    let getPath = (fullUrl) => {
        let a = document.createElement('a');
        a.href = fullUrl;

        return a.pathname;
    };

    let createTabAfterCurrent = (url) => {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            browser.tabs.create({
                url: url,
                index: tabs[0].index + 1
            });
        });
    };

    let toggleUmbraco = () => {
        let origin = getOrigin(currentUrl);

        createTabAfterCurrent(
            currentUrl.includes('/umbraco')
                ? origin // Navigate back to the homepage since we are in Umbraco.
                : origin + '/umbraco/' // Must have trailing slash for Umbraco 4.
        );
    };

    let openUmbracoNode = () => {
        let apiUrl = '/umbraco/backoffice/UmbracoApi/Entity/SearchAll?query=';
        let path = getPath(currentUrl);
        let alias = getAliasOfPath(path);
        let domain = getOrigin(currentUrl);

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
                    let json = JSON.parse(decruft(text));

                    createTabAfterCurrent(domain + '/umbraco/#/content/content/edit/' + json[0].results[0].id);
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
        if (clickTimeout != null) {
            clearTimeout(clickTimeout);

            clickTimeout = null;

            console.log('cleared', clickTimeout);

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
        openUmbracoNode: openUmbracoNode
    };
}();

