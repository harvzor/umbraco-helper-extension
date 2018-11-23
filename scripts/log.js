"use strict";

var log = function() {
    let name = '';

    helpers.getConfig()
        .then(config => {
            name = config.name;
        });

    // https://stackoverflow.com/questions/45001489/wrap-a-console-log-with-infinite-optional-params
    return function(...message) {
        console.log(`[${name}]`, ...message);
    };
}();
