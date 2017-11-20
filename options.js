"use strict";

browser = typeof browser === 'undefined' ? chrome : browser;

(function() {
    let altLogoEl = document.querySelector('#alt-logo')
    let contextMenuEl = document.querySelector('#context-menu')
    let delayEl = document.querySelector('#delay')

    let saveOptions = (e) => {
        e.preventDefault();

        browser.storage.sync.set({
            altLogo: altLogoEl.checked,
            contextMenu: contextMenuEl.checked,
            delay: delayEl.value
        })
        .then(() => {
            shared.setIcon();
            shared.contextMenus().setup();
            shared.delay.set(delayEl.value);
        }, (error) => {
            notify('Error saving options');
        });
    };

    let restoreOptions = () => {
        browser.storage.sync.get('altLogo')
            .then((result) => {
                altLogoEl.checked = Object.keys(result).length ? result.altLogo : false;
            }, (error) => {
                log(`Error: ${error}`);
            });

        browser.storage.sync.get('contextMenu')
            .then((result) => {
                contextMenuEl.checked = Object.keys(result).length ? result.contextMenu : true;
            }, (error) => {
                log(`Error: ${error}`);
            });

        browser.storage.sync.get('delay')
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

