browser = typeof browser === 'undefined' ? chrome : browser;

const open = {};

open.name = 'UmbracoOpen';
open.version = '0.5.0';

open.setIcon = () => {
    browser.storage.local.get('blueLogo')
        .then(function(result) {
            if (result.blueLogo) {
                browser.browserAction.setIcon({
                    path: {
                        30: 'icons/30-blue.png'
                    }
                });
            } else {
                browser.browserAction.setIcon({
                    path: {
                        48: 'icons/48.png'
                    }
                });
            }
        }, function(error) {
            console.log(`Error: ${error}`);
        });
};

// Create an anchor element to get the URL origin.
// http://stackoverflow.com/a/1421037
open.getOrigin = (fullUrl) => {
    let a = document.createElement("a");
    a.href = fullUrl;

    return a.origin;
};

open.toggleUmbraco = (fullUrl, index) => {
    let origin = open.getOrigin(fullUrl);

    browser.tabs.create({
        url:
            fullUrl.includes('/umbraco')
                ? origin // Navigate back to the homepage since we are in Umbraco.
                : origin + '/umbraco/', // Must have trailing slash for Umbraco 4.
        index: index
    });
};

// Where totalTime is the time spent going around this function.
open.clickEvent = (e, totalTime) => {
    // Wait 10 seconds before giving up.
    if (totalTime > 9999) {
        console.log(`[${open.name}]`, 'New page took too long to load. Giving up.');

        return;
    }

    browser.tabs.query({ currentWindow: true, active: true }, function(tabs) {
        if (tabs[0].status == 'loading') {
            setTimeout(() => {
                open.clickEvent(e, (totalTime || 0) + 100);
            }, 100);
        } else {
            open.toggleUmbraco(tabs[0].url, tabs[0].index + 1);
        }
    });
};

open.init = () => {
    browser.browserAction.onClicked.addListener(open.clickEvent);
};

open.init();
open.setIcon();

