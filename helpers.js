"use strict";

/**
 * Simple helper functions.
 */
var helpers = function() {
    /**
     * Get an Umbraco safe alias from a path.
     * @param {string} path
     */
    let getAliasOfPath = (path) => {
        return path
            .replace(/\//g, ' ')
            .replace(/-/g, ' ')
            .trim(' ');
    };

    /**
     * @param {string} text
     */
    let decruft = (text) => {
        return text.replace(")]}',", '');
    };

    /**
     * Create an anchor element to get the URL origin.
     * http://stackoverflow.com/a/1421037
     * @param {string} fullUrl
     */
    let getOrigin = (fullUrl) => {
        let a = document.createElement('a');
        a.href = fullUrl;

        return a.origin;
    };

    /**
     * Get path of a URL.
     * @param {string} fullUrl
     */
    let getPath = (fullUrl) => {
        let a = document.createElement('a');
        a.href = fullUrl;

        return a.pathname;
    };

    /**
     * Create a tab relative to the current tab.
     * @private
     * @param {string} url
     * @param {number} relativeIndex
     */
    let createTab = (url, relativeIndex) => {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            console.log(tabs);
            browser.tabs.create({
                url: url,
                index: tabs[0].index + relativeIndex
            });
        });
    };

    /**
     * @param {string} url
     */
    let createTabAfterCurrent = (url) => {
        createTab(url, 1);
    };

    /**
     * @param {string} url
     */
    let createTabBeforeCurrent = (url) => {
        // Because the new tab should sit at the index of the current tab.
        createTab(url, 0);
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
        createTabBeforeCurrent: createTabBeforeCurrent,
        getUmbracoId: getUmbracoId
    };
}();
