"use strict";

var helpers = function() {
    // Get an Umbraco safe alias from a path.
    let getAliasOfPath = (path) => {
        return path
            .replace(/\//g, ' ')
            .replace(/-/g, ' ')
            .trim(' ');
    };

    let decruft = (text) => {
        return text.replace(")]}',", '');
    };

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

    return {
        getAliasOfPath: getAliasOfPath,
        decruft: decruft,
        getOrigin: getOrigin,
        getPath: getPath,
        createTabAfterCurrent: createTabAfterCurrent
    };
}();

