browser = typeof browser === 'undefined' ? chrome : browser;

var open = function() {
    // Create an anchor element to get the URL origin.
    // http://stackoverflow.com/a/1421037
    let getOrigin = (fullUrl) => {
        let a = document.createElement("a");
        a.href = fullUrl;

        return a.origin;
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
        browser.tabs.query({ currentWindow: true, active: true }, function(tabs) {
            if (tabs[0].status == 'loading') {
                setTimeout(() => {
                    clickEvent(e, (totalTime || 0) + 100);
                }, 100);
            } else {
                toggleUmbraco(tabs[0].url, tabs[0].index + 1);
            }
        });
    };

    browser.browserAction.onClicked.addListener(clickEvent);
    shared.setIcon();

    return {
        name: 'UmbracoOpen',
        version: '0.5.0'
    };
}();

