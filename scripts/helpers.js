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
        browser.tabs.query({ currentWindow: true, active: true })
            .then((tabs) => {
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

    /**
     * @param {object} version Version of Umbraco such as { major: 7, minor: 5, release: 3 }
     * @param {object} json Result from the Umbraco API. Will change based on the version of Umbraco.
     * @param {string} matchDomain
     * @param {string} matchPath
    */
    let getUmbracoId = (json, matchDomain, matchPath) => {
        let results;

        if (json.constructor === Array) {
            results = json[0].results;
        }
        // https://umbraco.com/blog/hello-umbraco-77/ - ISearchableTree
        // Results were changed to include results from all of Umbraco,
        // including media etc. Before it only searched content.
        else {
            results = json.Content.results;
        }

        if (!results.length) {
            return null;
        }

        // Order by URL length descending.
        let resultsSorted = results.sort((a, b) => {
            return a.metaData.Url < b.metaData.Url;
        });

        for (let result of resultsSorted) {
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

    /**
     * Read a file.
     * https://stackoverflow.com/a/44516256/
     * @param {*} path Path to the file which should be read.
     * @returns {Promise} A promise.
     */
    let readFile = (path) => {
        return new Promise((resolve, reject) => {
            fetch(path, {mode:'same-origin'})
                .then(_res => {
                    return _res.blob();
                })
                .then(_blob => {
                    var reader = new FileReader();

                    reader.addEventListener("loadend", function() {
                        resolve(this.result);
                    });

                    reader.readAsText(_blob);
                })
                .catch(error => {
                    reject(error);
                });
        });
    };

    /**
     * Get the config file.
     */
    let getConfig = () => {
        return new Promise((resolve, reject) => {
            readFile('/config/config.json')
                .then(text => {
                    resolve(JSON.parse(text));
                })
                .catch(error => {
                    reject(error);
                });
        });
    };

    /**
     * Tests to see if input string is JSON.
     * @param {string} str
     */
    let isJson = (str) => {
        try {
            JSON.parse(str);
        } catch {
            return false;
        }

        return true;
    };

    /**
     * Detect if current browser is Firefox.
     * https://stackoverflow.com/a/9851769
     * @returns {boolean}
     */
    let isFirefox = () => {
        return typeof InstallTrigger !== 'undefined';
    };

    /**
     * Detect if current browser is Chrome.
     * https://stackoverflow.com/a/9851769
     * @returns {boolean}
     */
    let isChrome = () => {
        return !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    };

    return {
        getAliasOfPath: getAliasOfPath,
        decruft: decruft,
        getOrigin: getOrigin,
        getPath: getPath,
        createTabAfterCurrent: createTabAfterCurrent,
        createTabBeforeCurrent: createTabBeforeCurrent,
        getUmbracoId: getUmbracoId,
        readFile: readFile,
        getConfig: getConfig,
        isJson: isJson,
        isFirefox: isFirefox,
        isChrome: isChrome
    };
}();
