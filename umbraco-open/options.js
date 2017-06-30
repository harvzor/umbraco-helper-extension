//browser = typeof browser === 'undefined' ? chrome : browser;

(function() {
    console.log('loaded');
    let blueLogoEl = document.querySelector('#blue-logo')

    let saveOptions = (e) => {
        e.preventDefault();

        let success = () => {
            shared.setIcon();
        };

        let err = (error) => {
            console.log(`Error: ${error}`);
        };

        browser.storage.local.set({
            blueLogo: blueLogoEl.checked
        })
        .then(success, err);
    };

    let restoreOptions = () => {
        browser.storage.local.get('blueLogo')
            .then((result) => {
                blueLogoEl.checked = result.blueLogo || false;
            }, (error) => {
                console.log(`Error: ${error}`);
            });
    };

    document.addEventListener('DOMContentLoaded', restoreOptions);

    document.querySelector('form').addEventListener('submit', saveOptions);
})();

