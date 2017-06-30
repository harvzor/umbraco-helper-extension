browser = typeof browser === 'undefined' ? chrome : browser;

(function() {
    var blueLogoEl = document.querySelector('#blue-logo')

    var saveOptions = function(e) {
        browser.storage.local.set({
            blueLogo: blueLogoEl.checked
        });

        if (blueLogoEl.checked) {
            browser.browserAction.setIcon({
                path: {
                    30: 'icons/30-blue.png'
                }
            });
        } else {
            browser.browserAction.setIcon({
                path: {
                    48: 'icons/48.png'
                }
            });
        }
    };

    var restoreOptions = function() {
        browser.storage.local.get('blueLogo')
            .then(function(result) {
                blueLogoEl.checked = result.blueLogo || false;
            }, function(error) {
                console.log(`Error: ${error}`);
            });
    };

    document.addEventListener('DOMContentLoaded', restoreOptions);

    document.querySelector('form').addEventListener('submit', saveOptions);
})();

