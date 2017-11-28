"use strict";

(function() {
    let altLogoEl = document.querySelector('#alt-logo')
    let contextMenuEl = document.querySelector('#context-menu')
    let delayEl = document.querySelector('#delay')

    let onSubmit = (e) => {
        e.preventDefault();

        if (!e.target.checkValidity()) {
            notify("Please check input fields are valid.");
        }

        settings.useAltLogo.save(altLogoEl.checked);
        settings.createContextMenu.save(contextMenuEl.checked);
        settings.delayTime.save(delayEl.value);

        notify("Saved!");

        shared.setIcon();
        shared.contextMenus().setup();
    };

    let restoreOptions = () => {
        settings.useAltLogo.get()
            .then((value) => {
                altLogoEl.checked = value;
            });

        settings.createContextMenu.get()
            .then((value) => {
                contextMenuEl.checked = value;
            });

        settings.delayTime.get()
            .then((value) => {
                delayEl.value = value;
            });
    };

    document.addEventListener('DOMContentLoaded', restoreOptions);

    document.querySelector('form').addEventListener('submit', onSubmit, false);
})();
