browser = typeof browser === 'undefined' ? chrome : browser;

var open = function() {
    let currentUrl = '';

    let decruft = (text) => {
        return text.replace(")]}',", '');
    };

    let openUmbracoNode = () => {
        let apiUrl = '/umbraco/backoffice/UmbracoApi/Entity/SearchAll?query=';
        let path = getPath(currentUrl);
        let alias = getAliasOfPath(path);
        var domain = getOrigin(currentUrl);

        console.log('run', domain + apiUrl + alias);

        browser.cookies.get({
            url: domain,
            name: 'XSRF-TOKEN'
        })
        .then((cookie) => {
            console.log('token', cookie.value);

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
                    var json = JSON.parse(decruft(text));

                    browser.tabs.create({
                        url: domain + '/umbraco/#/content/content/edit/' + json[0].results[0].id
                        //index: 
                    });
                });
            })
            .catch((error) => {
                console.log('error', error);
            });
        });
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

    let toggleUmbraco = (fullUrl, index) => {
        let origin = getOrigin(fullUrl);

        browser.tabs.create({
            url:
                fullUrl.includes('/umbraco')
                    ? origin // Navigate back to the homepage since we are in Umbraco.
                    : origin + '/umbraco/', // Must have trailing slash for Umbraco 4.
            index: index
        });
    };

    // Where totalTime is the time spent going around this function.
    let clickEvent = (e, totalTime) => {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            toggleUmbraco(currentUrl, tabs[0].index + 1);

            /*
            if (tabs[0].status == 'loading') {
                setTimeout(() => {
                    clickEvent(e, (totalTime || 0) + 100);
                }, 100);
            } else {
                toggleUmbraco(tabs[0].url, tabs[0].index + 1);
            }
            */
        });
    };

    browser.browserAction.onClicked.addListener(clickEvent);
    shared.setIcon();

    return {
        name: 'UmbracoOpen',
        version: '0.6.0',
        openUmbracoNode: openUmbracoNode
    };
}();

