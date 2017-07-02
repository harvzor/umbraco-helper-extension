browser = typeof browser === 'undefined' ? chrome : browser;

const shared = function() {
    let setIcon = () => {
        browser.storage.local.get('altLogo')
            .then((result) => {
                if (result.altLogo) {
                    browser.browserAction.setIcon({
                        path: {
                            48: 'icons/48-orange.png'
                        }
                    });
                } else {
                    browser.browserAction.setIcon({
                        path: {
                            30: 'icons/30-blue.png'
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

