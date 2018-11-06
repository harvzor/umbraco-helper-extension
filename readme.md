# Productivity boosting Umbraco browser extension

Are you tired of opening a website, copying the URL, opening a new tab, pasting the URL, then adding `/umbraco/` to the end just so you can access the backoffice?

Well this is the extension for you!

At the click of a button, a new tab will be opened which will either open `/umbraco/` or go back the root of the website (if you're already in the backoffice).

## Find the Umbraco node for the current page

This extension also has the ability to find the Umbraco node for the current page you're looking at* - all at the click of a button.

*you must be logged in to Umbraco for this to work (not guaranteed to be able to find the current page)

## Controlling the extension

You can either click on the Umbraco logo button in the browser chrome to use the extension, or use the context menu which you can access by right clicking on any web page.

Please note:

- a single click of the browser button will toggle `/umbraco/`
- a double click will try to find the Umbraco node of the current page

## Compatibility

The main functionality of this extension (toggling the `/umbraco/` page) doesn't require any specific Umbraco version, it will work on any website, regardless of if it being run by Umbraco.

The secondary functionality of finding the node for the current page has been tested on Umbraco versions 7 to 7.5. Updates to the Umbraco API could stop this from working - please report a bug if you think the API has changed.

## Who's this for?

This extension is targeted at developers who frequently have to switch between Umbraco sites, and want to speed up their workflow.

The ability to find the current page is also insanely useful for websites that have a lot of nodes/pages.

## How does it work?

Toggling the `/umbraco/` page is quite straight forward.

It's much harder trying to retrieve the Umbraco node for the current page. To do this it:

- runs a search in Umbraco for the current page name, which is derived from the URL
- reads the result and gets the URL of top result
- opens a new tab with that URL

Querying Umbraco is actually quite hard as queries need to be sent with a cookie which is used for authentication. In order to get this cookie, you must be logged into Umbraco when you use the extension. The extension *steals* your authentication cookie then sends off the query.

Of course this is a potential security risk - the extension could do potentially malicious things such as deleting all the nodes... But since you can look at the source code, you can be certain that nothing dodgy is going on.

## Required permissions

An overview of which permissions this extension needs to function.

### Tabs

For creating tabs and getting the current tab URL.

### Storage

For saving settings.

### Cookies

For accessing Umbraco cookies so queries can be made on your behalf.

### Web navigation

Not sure...

### Notifications

To notify you of any errors.

### HTTP and HTTPs access

So queries can be made to the current Umbraco site APIs.

### Menus

Custom right-click context menu.

## Inspiration

I've been thinking about making this package since I started working on Umbraco. However, making extensions with the old XUL based Firefox extension API proved to be unnecesarily hard. But with the new cross-platform WebExtensions API, I finally managed to make this extension!

... A few years too late. It's true that there are some other Umbraco extensions already available. I came up with this idea on my own but as always, some others have beaten me to the punch. I can only hope that this project is at least better written, using newer APIs, with more features and less code.

## Contributing

Feel free to submit issues, features requests (through the issues) and pull requests. For any issues, if you think it is relevent, please include the:

- Umbraco version(s) you've tested on
- version of this extension
- browser and browser version

I'm a busy person and this is just another side project! I can't guarantee action but your help is still valued.

If you just want to say thanks, please Tweet about the extension - seeing that my work has improved the productivity of someone else makes my day a little bit brighter. If it's helped you, then some publicity might even mean that it can help someone else too.

## Developing

I strong recommend using the `web-ext` node based application to help with developing with Firefox. You can read about using it [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext).

Once installed (`npm install --global web-ext`), you can run it in the root of this repo (`web-ext run`). This will then launch Firefox so you can develop with automatic reloading of the package every time you make a change.

### Signing/packaging

#### Firefox

Signing with `web-ext sign` will submit the extension to AMO but will not make it listed - this option is for self distribution only. [They're working on this feature for Q1 2019](https://github.com/mozilla/web-ext/issues/804#issuecomment-426670076).

For now, the extension should be built using `web-ext build`, then manually uploading to AMO.

Sign for Firefox using `web-ext sign --api-key [key] --api-secret [secret]`. The key and secret can be found [here](https://addons.mozilla.org/en-US/developers/addon/api/key/) (JWT issuer and JWT secret respectively).

#### Chrome

Go to https://chrome.google.com/webstore/developer/update to upload a zip file to the Chrome store.

The zip should contain:

- /icons
- /scripts
- main.js
- manifest.json
- options.html
- options.js
- readme.md

## Roadmap

- public Firefox release
- Chrome release

## Disclaimer

This extension can make Umbraco API calls on your behalf. No updates are made using the API, and only queries are done. However, I will hold no liability for any damage this extension may do (although unlikely) to your website.

## Sidenote

It's crazy how much time I actually spent building this extension. It's partially a waste of time because similar packages already exist on the app store (although at the time of writing, there's nothing in the Firefox extensions because the old one didn't use the new APIs). However, I guess I learnt a lot and I had fun.

## License

MIT
