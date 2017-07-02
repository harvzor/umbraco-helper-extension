browser = typeof browser === 'undefined' ? chrome : browser;

(function() {
    console.log('loaded');
    let altLogoEl = document.querySelector('#alt-logo')

    let saveOptions = (e) => {
        e.preventDefault();

        let success = () => {
            shared.setIcon();
        };

        let err = (error) => {
            console.log(`Error: ${error}`);
        };

        browser.storage.local.set({
            altLogo: altLogoEl.checked
        })
        .then(success, err);
    };

    let restoreOptions = () => {
        browser.storage.local.get('altLogo')
            .then((result) => {
                altLogoEl.checked = result.altLogo || false;
            }, (error) => {
                console.log(`Error: ${error}`);
            });
    };

    document.addEventListener('DOMContentLoaded', restoreOptions);

    document.querySelector('form').addEventListener('submit', saveOptions);
})();

