"use strict";

(function() {
    let altLogoEl = document.querySelector('#alt-logo');
    let contextMenuEl = document.querySelector('#context-menu');
    let delayEl = document.querySelector('#delay');
    let menuLinksEl = document.querySelector('#menu-links');

    menuLinksEl.addEventListener('blur', () => {
        let value = menuLinksEl.value.trim();

        if (value === '') {
            value = '[]';

            menuLinksEl.value = value;
        }

        if (helpers.isJson(value)) {
            menuLinksEl.setCustomValidity('');
        } else {
            menuLinksEl.setCustomValidity('This text must be valid JSON.');
        }
    });

    let onSubmit = (e) => {
        e.preventDefault();

        if (!e.target.checkValidity()) {
            notify("Please check input fields are valid.");
        }

        settings.useAltLogo.save(altLogoEl.checked);
        settings.createContextMenu.save(contextMenuEl.checked);
        settings.delayTime.save(delayEl.value);
        settings.menuLinks.save(menuLinksEl.value.trim());

        notify("Saved!");

        shared.setIcon();
        shared.contextMenus.setup();
    };

    let restoreOptions = () => {
        settings.useAltLogo.get()
            .then(value => {
                altLogoEl.checked = value;
            });

        settings.createContextMenu.get()
            .then(value => {
                contextMenuEl.checked = value;
            });

        settings.delayTime.get()
            .then(value => {
                delayEl.value = value;
            });

        settings.menuLinks.get()
            .then(value => {
                menuLinksEl.value = value;
            });
    };

    document.addEventListener('DOMContentLoaded', restoreOptions);

    document.querySelector('form').addEventListener('submit', onSubmit);
})();
