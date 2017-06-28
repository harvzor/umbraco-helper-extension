browser = typeof browser === 'undefined' ? chrome : browser;

const open = {};

open.name = 'UmbracoOpen';
open.version = '0.3.0';
open.debug = false;

// Create an anchor element to get the URL origin.
// http://stackoverflow.com/a/1421037
open.getOrigin = (fullUrl) => {
    let a = document.createElement("a");
    a.href = fullUrl;

    return a.origin;
};

open.toggleUmbraco = (fullUrl) => {
    let origin = open.getOrigin(fullUrl);

    browser.tabs.create({
        "url":
            fullUrl.includes('/umbraco')
                ? origin // Navigate back to the homepage since we are in Umbraco.
                : origin + '/umbraco/' // Must have trailing slash for Umbraco 4.
    });
};

/*
open.clickEvent = function() {
    // Tab always returns undefined...
    var gettingCurrentTab = browser.tabs.getCurrent(function(tab) {
        console.log(tab);
    });

    function onGot(tabInfo) {
        browser.tabs.create({
            "url": tabInfo.url + '/umbraco'
        });
    };

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    gettingCurrentTab.then(onGot, onError);
}
*/

// Where totalTime is the time spent going around this function.
open.clickEvent = (e, totalTime) => {
    if (open.debug) {
        console.log(`[${open.name}]`, `Waited ${(totalTime || 0)}ms.`);
    }

    // Wait 10 seconds before giving up.
    if (totalTime > 9999) {
        console.log(`[${open.name}]`, 'New page took too long to load. Giving up.');

        return;
    }

    /*
    browser.tabs.getCurrent()
        .then((tab) => {
            console.log(tab);
        });
    */

    // Not supported by Firefox.
    //browser.tabs.getSelected()


    browser.tabs.query({ currentWindow: true, active: true }, function(tabs) {
        if (tabs[0].status == 'loading') {
            setTimeout(() => {
                open.clickEvent(e, (totalTime || 0) + 100);
            }, 100);
        } else {
            open.toggleUmbraco(tabs[0].url);
        }
    });
};

open.init = () => {
    /* This doesn't work for some reason.
    if (open.debug) {
        console.log(`[${open.name}]`, `Debug mode enabled on version ${open.version}.`);
    }
    */

    browser.browserAction.onClicked.addListener(open.clickEvent);
};

open.init();

