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

    let getUmbracoId = (json, matchDomain, matchPath) => {
        if (!json.length || !json[0].results.length) {
            return null;
        }

        // Order by URL length descending.
        let results = json[0].results.sort((a, b) => {
            return a.metaData.Url < b.metaData.Url;
        });

        for (let result of results) {
            let url = result.metaData.Url;

            if (url.startsWith('http')) {
                if (url.includes(matchDomain + matchPath)) {
                    return result.id;
                }
            } else if (url.includes(matchPath)) {
                return result.id;
            }
        }

        return null;
    };

    return {
        getAliasOfPath: getAliasOfPath,
        decruft: decruft,
        getOrigin: getOrigin,
        getPath: getPath,
        createTabAfterCurrent: createTabAfterCurrent,
        getUmbracoId: getUmbracoId
    };
}();

