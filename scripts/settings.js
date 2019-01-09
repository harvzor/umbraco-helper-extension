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
    let menuLinks = getterSetter('menuLinks', null);

    // If the extension has just been downloaded, I want to save the menu-links into local storage using the default
    // file.
    menuLinks.get()
        .then(value => {
            // The value will only ever be null when the extension is first run.
            if (value !== null) {
                return;
            }

            helpers.readFile('/config/menu-links.json')
                .then(text => {
                    menuLinks.save(text)
                })
                .catch(error => {
                    log(error);
                });
        })

    return {
        useAltLogo: useAltLogo,
        createContextMenu: createContextMenu,
        delayTime: delayTime,
        menuLinks: menuLinks
    };
}();
