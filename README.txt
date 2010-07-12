/**
 * jQuery Sparkle - jQuery's DRY Effect Library
 * Copyright (C) 2009-2010 Benjamin Arthur Lupton
 * http://www.balupton.com/projects/jquery-sparkle
 *
 * This file is part of jQuery Sparkle.
 * 
 * jQuery Sparkle is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * jQuery Sparkle is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with jQuery Sparkle.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @name readme
 * @package jquery-sparkle
 * @category jquery-plugin
 * @version 1.3.0-beta
 * @date July 12, 2010
 * @since 1.0.0-dev (July 01, 2010)
 * @category jQuery plugin
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
 * @example Visit {@link http://www.balupton.com/projects/jquery-sparkle} for more information.
 */
----

Installation & Usage:
1. Refer to the (demo/index.html) or http://www.balupton.com/projects/jquery-sparkle if the demo is not included.

Todo:
1. Make passwordstrength use BalClass

----

Changelog:

1.3.0-beta (July 12, 2010)
- Added length checks to all sparkle extensions (to prevent never-ending loops)
- Improved demo dramatically: Now includes Bespin and EventCalendar
- Moved $.ajaxCalendar to $.BalClass.EventCalendar now of production quality and works very well
- Fixed bespin init issue (if bespin already loaded, would not initialise).
- Tested in Chrome 5 OSX, Firefox 3.6 OSX, Opera 10.60 OSX

1.2.1-beta (July 11, 2010)
- Fixed typo in demo.
- Added $.fn.opacityFix and applied to subtle sparkle.
- Subtle sparkle now merges css and outCss for initial set.

1.2.1-beta (July 11, 2010)
- Added $.BalClass.create and $.BalClass.clone - updated BalClass extensions to use these - is it better? we have to wait to find out
- Added demo sparkle extension
- Added demo page, which covers installation, usage, and writing a BalClass plugin and Sparkle extension.
- Updated Makefile to include build-update to prevent having to fetch builders all the time

1.1.0-dev (July 09, 2010)
- Fixed up console if condition
- Restructured to now use resources folder
- Updated some doc tags; name, package, category, author, copyright
- Fixed example tag link
- Fixed some typos in CHECKLIST

1.0.0-dev (July 01, 2010)
- Split and cleaned Sparkle into multiple files, added Makefile

----