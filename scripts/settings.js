"use strict";

/**
 * For getting and setting extension options/settings.
 * Because this script is not shared between the main instance and the options instance, this should not be treated as a singleton.
 */
var settings = function() {
    let mode = 'local';

    /**
     * @param {string} name
     * @param {*} defaultValue
     * @private
     */
    let getterSetter = function(name, defaultValue) {
        let get = () => {
            return new Promise((resolve, reject) => {
                browser.storage[mode].get(name)
                    .then((result) => {
                        resolve(Object.keys(result).length ? result[name] : defaultValue);
                    })
                    .catch((error) => {
                        log(`Error: ${error}`);

                        reject();
                    });
            });
        };

        let save = (value) => {
            browser.storage[mode].set({
                [name]: value
            })
            .catch((error) => {
                log(`Error: ${error}`);
            });
        };

        return {
            get: get,
            save: save
        };
    };

    let useAltLogo = getterSetter('useAltLogo', false);
    let createContextMenu = getterSetter('createContextMenu', true);
    let delayTime = getterSetter('delayTime', 300);

    return {
        useAltLogo: useAltLogo,
        createContextMenu: createContextMenu,
        delayTime: delayTime
    };
}();
