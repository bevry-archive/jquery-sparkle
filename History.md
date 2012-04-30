## History

v1.5.2-beta, August 31, 2010
- $.fn.preventDefault is now called $.fn.preventDefaultOnClick to prevent jQuery UI issues.

v1.5.1-beta, August 31, 2010
- core.console now has better support for Internet Explorer

v1.5.0-beta, August 31, 2010
- Sparkle.addExtension will now fire the extensions on Sparkle.onReady
- Added $.promise in jquery.utilities
- Added Sparkle.onReady, Sparkle.onDocumentReady and Sparkle.onConfigured promises
- Added Sparkle.addExtensions
- Sparkle is no longer a singleton
- BalClass.create now works without any arguments
- This is a backwards incompatible release for those who have been using Sparkle.triggerExtension(Extension), you must now do Sparkle.triggerExtension(element,Extension);

v1.4.18-final, August 23, 2010
- Added $.fn.giveTarget

v1.4.17-final, August 21, 2010
- Updated core.console.js to now use throw instead of alert.
- Updated BalClass, Bespin and Sparkle to use window.console.error now instead of throw new Error - whether this is the right move time will tell.

v1.4.16-final, August 21, 2010
- Fixed an issue with triggering errors with BalClass and Sparkle
- Fixed an issue with adding extensions to Sparkle.

v1.4.15-final, August 20, 2010
- Updated styling for demo.
- Fixed Sparkle Demo Extension render issue in IE
- Fixed missing JSON issue in IE6 and IE7 for demo page
- Added a dev.js resource (which is not included in the compiled jquery.sparkle.js) for concept functions
- Updated Sparkle to v1.3.0, as we now support Sparkle.addExtension(Extension)
- Updated BalClass to v1.3.0, as we now support BalClass.create(Class) and BalClass.clone(Class) instead of having functions and config separate.

v1.4.14-final, August 19, 2010
- Added $.fn.preventDefault to prevent the default action for a click.

v1.4.13-final, August 19, 2010
- Fixed issue with enter special event if it has been defined included twice.
- Updated Syntax Highlighter include and initialisation. We use http://www.balupton.com/projects/jquery-syntaxhighlighter
- Code blocks within the demo are now using PRE instead of CODE elements due to a IE bug.
- Sparkle Demo Extension now uses PRE instead of CODE element due to an IE bug.
- Bespin is not included for IE as it results in an alert error.
- Improved installation instructions to make more clear.
- Fixed issue with datetimepicker if loaded before help.
- Added Datepicker, renamed timepicker and datetimepicker to Timepicker and Datetimepicker.
- Added HTML5 wrappers to Datetimepicker, Timepicker and Datepicker.
- Added $.fn.attemptTypeChangeTo for usage in attempting HTML5 input type changes.
- Fixed issue with bespin display, added height of 200px to demo.

v1.4.12-beta, August 11, 2010
- Fixed documentation for v1.4.11-beta changes

v1.4.11-beta, August 11, 2010
- Updated the EventCalendar to v1.2.0
- EventCalendar domEvents arguments are now: domEvent and details. Details contains: year, month, day, date, dayEntries, monthEntries, datepicker.
- This is backwards incompatible realise for the EventCalendar, besides the above change it remains compatible.

v1.4.10-beta, August 07, 2010
- Fixed $.fn.htmlAndSelf

v1.4.9-beta, August 07, 2010
- Changed BalClass create to extend the prototype without deep. As otherwise it would go too deep! When that is not needed.
- Added $.fn.htmlAndSelf to fetch the outerHTML of an element.
- Removed deprecated json2.min.js from demo. It was not being used.
- Updated demo to include production and development includes (production commented out).

v1.4.8-beta, August 01, 2010
- Added core.console to build, amazed that this wasn't included. This should fix any console errors people were experiencing in IE (if anyone was).
- Added new jquery.utilities

v1.4.7-beta, July 29, 2010
- The demo now includes a demo for using the EventCalendar with Ajax.
- EventCalendar now will issue a warning (via window.console.warn) if the Ajax request fails.

v1.4.6-beta, July 29, 2010
- The demo now uses the minified version again. Forgot to change it back. Minor change.

v1.4.5-beta, July 29, 2010
- Fixed incorrect docs in jquery.appendscriptstyle.js
- Fixed issue with EventCalendar not grabbing it's config properly.

v1.4.4-beta, July 28, 2010
- Updated licensing information. Still using the same license, as it is the best there is, but just provided some more information on it to make life simpler.

v1.4.3-beta, July 23, 2010
- $.appendScript and $.appendStylesheet now setTimeout if body has not yet loaded.

v1.4.2-beta, July 22, 2010
- core.string strip functions now still work if even if they weren't passed anything

v1.4.1-beta, July 22, 2010
- Converted all console. to window.console.
- core.string strip functions now escape by default, and regex with a optional param (possible b/c break)

v1.4.0-beta, July 16, 2010
- Added firstclick and lastclick events.
- Fixed singleclick event
- Fixed escape and enter events
- Prevented "-"s from being added to the front and back of slugs
- Fixed queryStringToJSON in the case of object recreation
- Added demos for the events, querySTringToJSON and toSlug
- Added JSON detection and auto-include if needed
- Moved the demo resources/scripts into the BODY element, such that it will load asynchronously and fix unmatched warnings in chrome
- Fixed global variable leaks in jquery.balclass.bespin
- Added a google closure inspector map to the google closure compilation
- Known Issue: Demo page is including the yoursite example stylesheet in Google Chrome. This is due to either Bespin or Syntax Highlighter. Only a minor issue which only applies to the demo. So no worries.
- Tested in Chrome 5 OSX, Safari 5.0, Firefox 3.6 OSX, Opera 10.60 OSX } Opera does not support the cancel event, or bespin.

v1.3.0-beta, July 12, 2010
- Added length checks to all sparkle extensions (to prevent never-ending loops)
- Improved demo dramatically: Now includes Bespin and EventCalendar
- Moved $.ajaxCalendar to $.BalClass.EventCalendar now of production quality and works very well
- Fixed bespin init issue (if bespin already loaded, would not initialise).
- Tested in Chrome 5 OSX, Safari 5.0, Firefox 3.6 OSX, Opera 10.60 OSX

v1.2.1-beta, July 11, 2010
- Fixed typo in demo.
- Added $.fn.opacityFix and applied to subtle sparkle.
- Subtle sparkle now merges css and outCss for initial set.

v1.2.1-beta, July 11, 2010
- Added $.BalClass.create and $.BalClass.clone - updated BalClass extensions to use these - is it better? we have to wait to find out
- Added demo sparkle extension
- Added demo page, which covers installation, usage, and writing a BalClass plugin and Sparkle extension.
- Updated Makefile to include build-update to prevent having to fetch builders all the time

v1.1.0-dev, July 09, 2010
- Fixed up console if condition
- Restructured to now use resources folder
- Updated some doc tags; name, package, category, author, copyright
- Fixed example tag link
- Fixed some typos in CHECKLIST

v1.0.0-dev, July 01, 2010
- Split and cleaned Sparkle into multiple files, added Makefile

v0.1.0-dev, December 01, 2009
- Initial release
