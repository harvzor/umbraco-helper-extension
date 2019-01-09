"use strict";

var log = function() {
    let name = '';

    // Bug: the name sometimes isn't found before something is logged.
    helpers.getConfig()
        .then(config => {
            name = config.name;
        });

    // https://stackoverflow.com/questions/45001489/wrap-a-console-log-with-infinite-optional-params
    return function(...message) {
        //console.log(`[${name}]`, ...message);
        console.trace(`[${name}]`, ...message);
    };
}();
