"use strict";

browser = typeof browser === 'undefined' ? chrome : browser;

(function() {
    let altLogoEl = document.querySelector('#alt-logo')
    let delayEl = document.querySelector('#delay')

    let saveOptions = (e) => {
        e.preventDefault();

        browser.storage.local.set({
            altLogo: altLogoEl.checked,
            delay: delayEl.value
        })
        .then(() => {
            shared.setIcon();
            shared.delay.set(delayEl.value);
        }, (error) => {
            notify('Error saving options');
        });
    };

    let restoreOptions = () => {
        browser.storage.local.get('altLogo')
            .then((result) => {
                altLogoEl.checked = Object.keys(result).length ? result.altLogo : false;
            }, (error) => {
                log(`Error: ${error}`);
            });

        browser.storage.local.get('delay')
            .then((result) => {
                let value = Object.keys(result).length ? result.delay : 300;

                delayEl.value = value;

                shared.delay.set(value);
            }, (error) => {
                log(`Error: ${error}`);
            });
    };

    document.addEventListener('DOMContentLoaded', restoreOptions);

    document.querySelector('form').addEventListener('submit', saveOptions);
})();

