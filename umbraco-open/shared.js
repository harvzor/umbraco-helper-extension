browser = typeof browser === 'undefined' ? chrome : browser;

const shared = function() {
    var setIcon = () => {
        browser.storage.local.get('blueLogo')
            .then((result) => {
                if (result.blueLogo) {
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
            }, (error) => {
                console.log(`Error: ${error}`);
            });
    };

    return {
        setIcon: setIcon
    };
}();

