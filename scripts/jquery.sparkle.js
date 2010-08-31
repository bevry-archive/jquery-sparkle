/**
 * @depends nothing
 * @name core.array
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * Remove a element, or a set of elements from an array
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright John Resig
 * @license MIT License - {@link http://opensource.org/licenses/mit-license.php}
 */
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

/**
 * Get a element from an array at [index]
 * if [current] is set, then set this index as the current index (we don't care if it doesn't exist)
 * @version 1.0.1
 * @date July 09, 2010
 * @since 1.0.0 June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.get = function(index, current) {
	// Determine
	if ( index === 'first' ) {
		index = 0;
	} else if ( index === 'last' ) {
		index = this.length-1;
	} else if ( index === 'prev' ) {
		index = this.index-1;
	} else if ( index === 'next' ) {
		index = this.index+1;
	} else if ( !index && index !== 0 ) {
		index = this.index;
	}
	
	// Set current?
	if ( current||false !== false ) {
		this.setIndex(index);
	}
	
	// Return
	return this.exists(index) ? this[index] : undefined;
};

/**
 * Apply the function {handler} to each element in the array
 * Return false in the {handler} to break the cycle.
 * @param {Function} handler
 * @version 1.0.1
 * @date August 20, 2010
 * @since June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.each = function(handler){
	for (var i = 0; i < this.length; ++i) {
		var value = this[i];
		if ( handler.apply(value,[i,value]) === false ) {
			break;
		}
	}
	return this;
}

/**
 * Checks whether the index is a valid index
 * @version 1.0.0
 * @date July 09, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.validIndex = function(index){
	return index >= 0 && index < this.length;
};

/**
 * Set the current index of the array
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.setIndex = function(index){
	if ( this.validIndex(index) ) {
		this.index = index;
	} else {
		this.index = null;
	}
	return this;
};

/**
 * Get the current index of the array
 * If [index] is passed then set that as the current, and return it's value
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.current = function(index){
	return this.get(index, true);
};

/**
 * Get whether or not the array is empty
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.isEmpty = function(){
	return this.length === 0;
};

/**
 * Get whether or not the array has only one item
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.isSingle = function(){
	return this.length === 1;
};

/**
 * Get whether or not the array is not empty
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.isNotEmpty = function(){
	return this.length !== 0;
};

/**
 * Get whether or not the array has more than one item
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.isNotEmpty = function(){
	return this.length > 1;
};

/**
 * Get whether or not the current index is the last one
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.isLast = function(index){
	index = typeof index === 'undefined' ? this.index : index;
	return !this.isEmpty() && index === this.length-1;
}

/**
 * Get whether or not the current index is the first one
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.isFirst = function(index){
	index = typeof index === 'undefined' ? this.index : index;
	return !this.isEmpty() && index === 0;
}

/**
 * Clear the array
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.clear = function(){
	this.length = 0;
};

/**
 * Set the index as the next one, and get the item
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.next = function(update){
	return this.get(this.index+1, update);
};

/**
 * Set the index as the previous one, and get the item
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.prev = function(update){
	return this.get(this.index-1, update);
};

/**
 * Reset the index
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.reset = function(){
	this.index = null;
	return this;
};

/**
 * Set the [index] to the [item]
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.set = function(index, item){
	// We want to set the item
	if ( index < this.length && index >= 0 ) {
		this[index] = item;
	} else {
		throw new Error('Array.prototype.set: [index] above this.length');
		// return false;
	}
	return this;
};

/**
 * Set the index as the next item, and return it.
 * If we reach the end, then start back at the beginning.
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.loop = function(){
	if ( !this.index && this.index !== 0 ) {
		// index is not a valid value
		return this.current(0);
	}
	return this.next();
};

/**
 * Add the [arguments] to the array
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.add = function(){
	this.push.apply(this,arguments);
	return this;
};

/**
 * Insert the [item] at the [index] or at the end of the array
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.insert = function(index, item){
	if ( typeof index !== 'number' ) {
		index = this.length;
	}
	index = index<=this.length ? index : this.length;
	var rest = this.slice(index);
	this.length = index;
	this.push(item);
	this.push.apply(this, rest);
	return this;
};

/**
 * Get whether or not the index exists in the array
 * @version 1.0.0
 * @date July 09, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.exists = Array.prototype.exists || function(index){
	return typeof this[index] !== 'undefined';
};

/**
 * Get whether or not the value exists in the array
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Array.prototype.has = Array.prototype.has || function(value){
	var has = false;
	for ( var i=0, n=this.length; i<n; ++i ) {
		if ( value == this[i] ) {
			has = true;
			break;
		}
	}
	return has;
};
/**
 * @depends nothing
 * @name core.console
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * Console Emulator
 * We have to convert arguments into arrays, and do this explicitly as webkit (chrome) hates function references, and arguments cannot be passed as is
 * @version 1.0.3
 * @date August 31, 2010
 * @since 0.1.0-dev, December 01, 2009
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */

// Check to see if console exists, if not define it
if ( typeof window.console === 'undefined' ) {
	window.console = {};
}

// Check to see if we have emulated the console yet
if ( typeof window.console.emulated === 'undefined' ) {
	// Emulate Log
	if ( typeof window.console.log === 'function' ) {
		window.console.hasLog = true;
	}
	else {
		if ( typeof window.console.log === 'undefined' ) {
			window.console.log = function(){};
		}
		window.console.hasLog = false;
	}
	
	// Emulate Debug
	if ( typeof window.console.debug === 'function' ) {
		window.console.hasDebug = true;
	}
	else {
		if ( typeof window.console.debug === 'undefined' ) {
			window.console.debug = !window.console.hasLog ? function(){} : function(){
				var arr = ['console.debug:']; for(var i = 0; i < arguments.length; i++) { arr.push(arguments[i]); };
		    	window.console.log.apply(window.console, arr);
			};
		}
		window.console.hasDebug = false;
	}
	
	// Emulate Warn
	if ( typeof window.console.warn === 'function' ) {
		window.console.hasWarn = true;
	}
	else {
		if ( typeof window.console.warn === 'undefined' ) {
			window.console.warn = !window.console.hasLog ? function(){} : function(){
				var arr = ['console.warn:']; for(var i = 0; i < arguments.length; i++) { arr.push(arguments[i]); };
		    	window.console.log.apply(window.console, arr);
			};
		}
		window.console.hasWarn = false;
	}
	
	// Emulate Error
	if ( typeof window.console.error === 'function' ) {
		window.console.hasError = true;
	}
	else {
		if ( typeof window.console.error === 'undefined' ) {
			window.console.error = function(){
				var msg = "An error has occured.";
				
				// Log
				if ( window.console.hasLog ) {
					var arr = ['console.error:']; for(var i = 0; i < arguments.length; i++) { arr.push(arguments[i]); };
		    		window.console.log.apply(window.console, arr);
					// Adjust Message
					msg = 'An error has occured. More information is available in your browser\'s javascript console.'
				}
				
				// Prepare Arguments
				for ( var i = 0; i < arguments.length; ++i ) {
					if ( typeof arguments[i] !== 'string' ) {
						break;
					}
					msg += "\n"+arguments[i];
				}
				
				// Throw Error
				if ( typeof Error !== 'undefined' ) {
					throw new Error(msg);
				}
				else {
					throw(msg);
				}
			};
		}
		window.console.hasError = false;
	}
	
	// Emulate Trace
	if ( typeof window.console.trace === 'function' ) {
		window.console.hasTrace = true;
	}
	else {
		if ( typeof window.console.trace === 'undefined' ) {
			window.console.trace = function(){
				window.console.error('console.trace does not exist');
			};
		}
		window.console.hasTrace = false;
	}
	
	// Done
	window.console.emulated = true;
}
/**
 * @depends nothing
 * @name core.date
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * Apply the Datetime string to the current Date object
 * Datetime string in the format of "year month day hour min sec". "hour min sec" all optional.
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Date.prototype.setDatetimestr = Date.prototype.setDatetimestr || function(timestamp){
	// Set the datetime from a string
	var pieces = timestamp.split(/[\-\s\:]/g);
	var year = pieces[0];
	var month = pieces[1];
	var day = pieces[2];
	var hour = pieces[3]||0;
	var min = pieces[4]||0;
	var sec = pieces[5]||0;
	this.setUTCFullYear(year,month-1,day);
	this.setUTCHours(hour);
	this.setUTCMinutes(min);
	this.setUTCSeconds(sec);
	return this;
};

/**
 * Apply the Date string to the current Date object
 * Date string in the format of "year month day". "year month day" all optional.
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Date.prototype.setDatestr = Date.prototype.setDatestr || function(timestamp){
	// Set the date from a string
	var pieces = timestamp.split(/[\-\s\:]/g);
	var year = pieces[0]||1978;
	var month = pieces[1]||0;
	var day = pieces[2]||1;
	this.setUTCFullYear(year,month-1,day);
	return this;
};

/**
 * Apply the Time string to the current Date object
 * Time string in the format of "hour min sec". "hour min sec" all optional.
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Date.prototype.setTimestr = Date.prototype.setTimestr || function(timestamp){
	// Set the time from a string
	var pieces = timestamp.split(/[\-\s\:]/g);
	var hour = pieces[0]||0;
	var min = pieces[1]||0;
	var sec = pieces[2]||0;
	this.setUTCHours(hour);
	this.setUTCMinutes(min);
	this.setUTCSeconds(sec);
	return this;
};

/**
 * Return the Date as a Datetime string
 * Datetime string in the format of "year-month-date hours:minutes:seconds".
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Date.prototype.getDatetimestr = Date.prototype.getDatetimestr || function() {
	// Get the datetime as a string
	var date = this;
	return date.getDatestr()+' '+date.getTimestr();
};

/**
 * Return the Date as a Datetime string
 * Datetime string in the format of "year-month-date".
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Date.prototype.getDatestr = Date.prototype.getDatestr || function() {
	// Get the date as a string
	var date = this;
	var year = date.getUTCFullYear();
	var month = (this.getUTCMonth() + 1).padLeft(0,2);
	var date = this.getUTCDate().padLeft(0,2);
	return year+'-'+month+'-'+date;
};

/**
 * Return the Date as a Datetime string
 * Datetime string in the format of "hours:minutes:seconds".
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Date.prototype.getTimestr = Date.prototype.getTimestr || function(){
	// Get the time as a string
	var date = this;
	var hours = date.getUTCHours().padLeft(0,2);
	var minutes = date.getUTCMinutes().padLeft(0,2);
	var seconds = date.getUTCSeconds().padLeft(0,2);
	return hours+':'+minutes+':'+seconds;
};

/**
 * Return the Date as a ISO 8601 date string
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Date.prototype.getDatetime = String.prototype.getDatetime || function(){
	// Get a ISO 8601 date
	var now = this;
	var datetime = now.getUTCFullYear() + '-' +
		(now.getUTCMonth()+1).zeroise(2) + '-' +
		now.getUTCDate().zeroise(2) + 'T' +
		now.getUTCHours().zeroise(2) + ':' +
		now.getUTCMinutes().zeroise(2) + ':' +
		now.getUTCSeconds().zeroise(2) + '+00:00';
	return datetime;
};
/**
 * @depends nothing
 * @name core.number
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * Return a new string with zeroes added correctly to the front of the number, given the threshold
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Number.prototype.zeroise = String.prototype.zeroise = String.prototype.zeroise ||function(threshold){
	var number = this,
		str = number.toString();
	if (number < 0) { str = str.substr(1, str.length) }
	while (str.length < threshold) { str = '0' + str }
	if (number < 0) { str = '-' + str }
	return str;
};

/**
 * Return a new string with the string/number padded left using [ch] of [num] length
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Number.prototype.padLeft = String.prototype.padLeft = String.prototype.padLeft ||function(ch, num){
	var val = String(this);
	var re = new RegExp('.{' + num + '}$');
	var pad = '';
	if ( !ch && ch !== 0 ) ch = ' ';
	do  {
		pad += ch;
	} while(pad.length < num);
	return re.exec(pad + val)[0];
};

/**
 * Return a new string with the string/number padded right using [ch] of [num] length
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Number.prototype.padRight = String.prototype.padRight = String.prototype.padRight ||function(ch, num){
	var val = String(this);
	var re = new RegExp('^.{' + num + '}');
	var pad = '';
	if ( !ch && ch !== 0 ) ch = ' ';
	do {
		pad += ch;
	} while (pad.length < num);
	return re.exec(val + pad)[0];
};

/**
 * Return a new number with the current number rounded to [to]
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
Number.prototype.roundTo = String.prototype.roundTo = String.prototype.roundTo || function(to){
	var val = String(parseInt(this,10));
	val = parseInt(val.replace(/[1,2]$/, 0).replace(/[3,4]$/, 5),10);
	return val;
};
/**
 * @depends nothing
 * @name core.string
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * Return a new string with any spaces trimmed the left and right of the string
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
String.prototype.trim = String.prototype.trim || function() {
	// Trim off any whitespace from the front and back
	return this.replace(/^\s+|\s+$/g, '');
};

/**
 * Return a new string with the value stripped from the left and right of the string
 * @version 1.1.1
 * @date July 22, 2010
 * @since 1.0.0, June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
String.prototype.strip = String.prototype.strip || function(value,regex){
	// Strip a value from left and right, with optional regex support (defaults to false)
	value = String(value);
	var str = this;
	if ( value.length ) {
		if ( !(regex||false) ) {
			// We must escape value as we do not want regex support
			value = value.replace(/([\[\]\(\)\^\$\.\?\|\/\\])/g, '\\$1');
		}
		str = str.replace(eval('/^'+value+'+|'+value+'+$/g'), '');
	}
	return String(str);
}

/**
 * Return a new string with the value stripped from the left of the string
 * @version 1.1.1
 * @date July 22, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
String.prototype.stripLeft = String.prototype.stripLeft || function(value,regex){
	// Strip a value from the left, with optional regex support (defaults to false)
	value = String(value);
	var str = this;
	if ( value.length ) {
		if ( !(regex||false) ) {
			// We must escape value as we do not want regex support
			value = value.replace(/([\[\]\(\)\^\$\.\?\|\/\\])/g, '\\$1');
		}
		str = str.replace(eval('/^'+value+'+/g'), '');
	}
	return String(str);
}

/**
 * Return a new string with the value stripped from the right of the string
 * @version 1.1.1
 * @date July 22, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
String.prototype.stripRight = String.prototype.stripRight || function(value,regex){
	// Strip a value from the right, with optional regex support (defaults to false)
	value = String(value);
	var str = this;
	if ( value.length ) {
		if ( !(regex||false) ) {
			// We must escape value as we do not want regex support
			value = value.replace(/([\[\]\(\)\^\$\.\?\|\/\\])/g, '\\$1');
		}
		str = str.replace(eval('/'+value+'+$/g'), '');
	}
	return String(str);
}

/**
 * Return a int of the string
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
String.prototype.toInt = String.prototype.toInt || function(){
	// Convert to a Integer
	return parseInt(this,10);
};

/**
 * Return a new string of the old string wrapped with the start and end values
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
String.prototype.wrap = String.prototype.wrap || function(start,end){
	// Wrap the string
	return start+this+end;
};

/**
 * Return a new string of a selection of the old string wrapped with the start and end values
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
String.prototype.wrapSelection = String.prototype.wrapSelection || function(start,end,a,z){
	// Wrap the selection
	if ( typeof a === 'undefined' || a === null ) a = this.length;
	if ( typeof z === 'undefined' || z === null ) z = this.length;
	return this.substring(0,a)+start+this.substring(a,z)+end+this.substring(z);
};

/**
 * Return a new string of the slug of the old string
 * @version 1.1.0
 * @date July 16, 2010
 * @since 1.0.0, June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
String.prototype.toSlug = String.prototype.toSlug || function(){
	// Convert a string to a slug
	return this.toLowerCase().replace(/[\s_]/g, '-').replace(/[^-a-z0-9]/g, '').replace(/--+/g, '-').replace(/^-+|-+$/g,'');
}

/**
 * Return a new JSON object of the old string.
 * Turns:
 * 		file.js?a=1&amp;b.c=3.0&b.d=four&a_false_value=false&a_null_value=null
 * Into:
 * 		{"a":1,"b":{"c":3,"d":"four"},"a_false_value":false,"a_null_value":null}
 * @version 1.1.0
 * @date July 16, 2010
 * @since 1.0.0, June 30, 2010
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
 */
String.prototype.queryStringToJSON = String.prototype.queryStringToJSON || function ( )
{	// Turns a params string or url into an array of params
	// Prepare
	var params = String(this);
	// Remove url if need be
	params = params.substring(params.indexOf('?')+1);
	// params = params.substring(params.indexOf('#')+1);
	// Change + to %20, the %20 is fixed up later with the decode
	params = params.replace(/\+/g, '%20');
	// Do we have JSON string
	if ( params.substring(0,1) === '{' && params.substring(params.length-1) === '}' )
	{	// We have a JSON string
		return eval(decodeURIComponent(params));
	}
	// We have a params string
	params = params.split(/\&(amp\;)?/);
	var json = {};
	// We have params
	for ( var i = 0, n = params.length; i < n; ++i )
	{
		// Adjust
		var param = params[i] || null;
		if ( param === null ) { continue; }
		param = param.split('=');
		if ( param === null ) { continue; }
		// ^ We now have "var=blah" into ["var","blah"]
		
		// Get
		var key = param[0] || null;
		if ( key === null ) { continue; }
		if ( typeof param[1] === 'undefined' ) { continue; }
		var value = param[1];
		// ^ We now have the parts
		
		// Fix
		key = decodeURIComponent(key);
		value = decodeURIComponent(value);
		try {
		    // value can be converted
		    value = eval(value);
		} catch ( e ) {
		    // value is a normal string
		}
		
		// Set
		// window.console.log({'key':key,'value':value}, split);
		var keys = key.split('.');
		if ( keys.length === 1 )
		{	// Simple
			json[key] = value;
		}
		else
		{	// Advanced (Recreating an object)
			var path = '',
				cmd = '';
			// Ensure Path Exists
			$.each(keys,function(ii,key){
				path += '["'+key.replace(/"/g,'\\"')+'"]';
				jsonCLOSUREGLOBAL = json; // we have made this a global as closure compiler struggles with evals
				cmd = 'if ( typeof jsonCLOSUREGLOBAL'+path+' === "undefined" ) jsonCLOSUREGLOBAL'+path+' = {}';
				eval(cmd);
				json = jsonCLOSUREGLOBAL;
				delete jsonCLOSUREGLOBAL;
			});
			// Apply Value
			jsonCLOSUREGLOBAL = json; // we have made this a global as closure compiler struggles with evals
			valueCLOSUREGLOBAL = value; // we have made this a global as closure compiler struggles with evals
			cmd = 'jsonCLOSUREGLOBAL'+path+' = valueCLOSUREGLOBAL';
			eval(cmd);
			json = jsonCLOSUREGLOBAL;
			delete jsonCLOSUREGLOBAL;
			delete valueCLOSUREGLOBAL;
		}
		// ^ We now have the parts added to your JSON object
	}
	return json;
};
/**
 * @depends jquery
 * @name jquery.appendscriptstyle
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * Append a Stylesheet to the DOM
	 * @version 1.1.0
	 * @date July 23, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.appendStylesheet = $.appendStylesheet || function(url, overwrite){
		// Check
		if ( !(document.body||false) ) {
			setTimeout(function(){
				$.appendStylesheet.apply($,[url,overwrite]);
			},500);
			// Chain
			return $;
		}
		
		// Prepare
		var id = 'stylesheet-'+url.replace(/[^a-zA-Z0-9]/g, '');;
		var $old = $('#'+id);
		if ( typeof overwrite === 'undefined' ) {
			overwrite = false;
		}
		
		// Check
		if ( $old.length === 1 ) {
			if ( overwrite ) {
				$old.remove();
			}
			else {
				// Chain
				return $;
			}
		}
		
		// Create
		var bodyEl = document.getElementsByTagName($.browser.safari ? 'head' : 'body')[0];
		var linkEl = document.createElement('link');
		linkEl.type = 'text/css';
		linkEl.rel = 'stylesheet';
		linkEl.media = 'screen';
		linkEl.href = url;
		linkEl.id = id;
		bodyEl.appendChild(linkEl);
		
		// Chain
		return $;
	};
	
	/**
	 * Append a Script to the DOM
	 * @version 1.1.0
	 * @date July 23, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.appendScript = $.appendScript || function(url, overwrite){
		// Check
		if ( !(document.body||false) ) {
			setTimeout(function(){
				$.appendScript.apply($,[url,overwrite]);
			},500);
			// Chain
			return $;
		}
		
		// Prepare
		var id = 'script-'+url.replace(/[^a-zA-Z0-9]/g, '');;
		var $old = $('#'+id);
		if ( typeof overwrite === 'undefined' ) {
			overwrite = false;
		}
		
		// Check
		if ( $old.length === 1 ) {
			if ( overwrite ) {
				$old.remove();
			}
			else {
				// Chain
				return $;
			}
		}
		
		// Create
		var bodyEl = document.getElementsByTagName($.browser.safari ? 'head' : 'body')[0];
		var scriptEl = document.createElement('script');
		scriptEl.type = 'text/javascript';
		scriptEl.src = url;
		scriptEl.id = id;
		bodyEl.appendChild(scriptEl);
		
		// Chain
		return $;
	};
	

})(jQuery);
/**
 * @depends jquery
 * @name jquery.extra
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * Opacity Fix for Text without Backgrounds
	 * Fixes the text corrosion during opacity effects by forcing a background-color value on the element.
	 * The background-color value is the the same value as the first parent div which has a background-color.
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.opacityFix = $.fn.opacityFix || function(){
		var $this = $(this);
		
		// Check if this fix applies
		var color = $this.css('background-color');
		if ( color && color !== 'rgba(0, 0, 0, 0)' ) {
			return this;
		}
		
		// Apply the background colour of the first parent which has a background colour
		var $parent = $this;
		while ( $parent.inDOM() ) {
			$parent = $parent.parent();
			color = $parent.css('background-color');
			if ( color && color !== 'rgba(0, 0, 0, 0)' ) {
				$this.css('background-color',color);
				break;
			}
		}
		
		// Chain
		return this;
	};
	
	/**
	 * Get all elements above ourself which match the selector, and include ourself in the search
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.parentsAndSelf = $.fn.parentsAndSelf || function(selector){
		var $this = $(this);
		return $this.parents(selector).andSelf().filter(selector);
	};
	
	/**
	 * Get all elements within ourself which match the selector, and include ourself in the search
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.findAndSelf = $.fn.findAndSelf || function(selector){
		var $this = $(this);
		return $this.find(selector).andSelf().filter(selector);
	};
	
	/**
	 * Find the first input, and include ourself in the search
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.firstInput = $.fn.firstInput || function(){
		var $this = $(this);
		return $this.findAndSelf(':input').filter(':first');
	};
	
	/**
	 * Select a option within options, checkboxes, radios and selects.
	 * Rather than setting the actual value of a element which $el.val does.
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.choose = $.fn.choose||function(value){
		var $this = $(this);
		if ( typeof value === 'undefined' ) {
			value = $this.val();
		} else if ( $this.val() !== value ) {
			// Return early, don't match
			return this;
		}
		switch ( true ) {
			case this.is('option'):
				$this.parents('select:first').choose(value);
				break;
			case $this.is(':checkbox'):
				$this.attr('checked', true);
				break;
			case $this.is(':radio'):
				$this.attr('checked', true);
				break;
			case $this.is('select'):
				$this.val(value);
				break;
			default:
				break;
		}
		return this;
	};
	
	/**
	 * Deselect a option within options, checkboxes, radios and selects.
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.unchoose = $.fn.unchoose||function(){
		var $this = $(this);
		switch ( true ) {
			case $this.is('option'):
				$this.parents(':select:first').unchoose();
				break;
			case $this.is(':checkbox'):
				$this.attr('checked', false);
				break;
			case $this.is(':radio'):
				$this.attr('checked', false);
				break;
			case $this.is('select'):
				$this.val($this.find('option:first').val());
				break;
			default:
				break;
		}
		return this;
	};
	
	/**
	 * Checks if the element would be passed with the form if the form was submitted.
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.wouldSubmit = $.fn.wouldSubmit || function(){
		var $input = $(this).findAndSelf(':input');
		var result = true;
		if ( !$input.length || !($input.attr('name')||false) || ($input.is(':radio,:checkbox') && !$input.is(':selected,:checked')) ) {
			result = false;
		}
		return result;
	};
	
	/**
	 * Grab all the values of a form in JSON format if the form would be submitted.
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.values = $.fn.values || function(){
		var $inputs = $(this).findAndSelf(':input');
		var values = {};
		$inputs.each(function(){
			var $input = $(this);
			var name = $input.attr('name') || null;
			var value = $input.val();
			// Skip if wouldn't submit
			if ( !$input.wouldSubmit() ) {
				return true;
			}
			// Set value
			if (name.indexOf('[]') !== -1) {
				// We want an array
				if (typeof values[name] === 'undefined') {
					values[name] = [];
				}
				values[name].push(value);
			}
			else {
				values[name] = value;
			}
		});
		return values;
	};
	
	/**
	 * Submit the form which the element is associated with.
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.submitForm = $.fn.submitForm || function(){
		// Submit the parent form or our form
		var $this = $(this);
		// Handle
		var $form = $this.parentsAndSelf('form:first').trigger('submit');
		// Chain
		return $this;
	};
	
	/**
	 * Checks if the element is attached within the DOM
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.inDOM = $.fn.inDOM || function(){
		var $ancestor = $(this).parent().parent();
		return $ancestor.size() && ($ancestor.height()||$ancestor.width());
	};
	
	/**
	 * Wrap the element's value with the passed start and end text
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.valWrap = $.fn.valWrap || function(start,end){
		// Wrap a value
		var $field = $(this);
		return $field.val($field.val().wrap(start,end));
	};
	
	/**
	 * Wrap a selection of the element's value with the passed start and end text
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.valWrapSelection = $.fn.valWrapSelection || function(start,end,a,z){
		// Wrap the selected text
		var $field = $(this);
		var field = $field.get(0);
		start = start||'';
		end = end||'';
		if ( a || z ) {
			$field.val($field.val().wrapSelection(start,end,a,z));
		}
		else {
			var a = field.selectionStart,
				z = field.selectionEnd;
			if ( document.selection) {
				field.focus();
				var sel = document.selection.createRange();
				sel.text = start + sel.text + end;
			}
			else {
				var scrollTop = field.scrollTop;
				$field.val($field.val().wrapSelection(start,end,a,z));
				field.focus();
				field.selectionStart = a+start.length;
				field.selectionEnd = z+start.length;
				field.scrollTop = scrollTop;
			}
		}
		return $field;
	};
	
	/**
	 * Find (with regards to the element) the first visible input element, and give focus to it
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.giveFocus = $.fn.giveFocus || function(){
		// Give focus to the current element
		var $this = $(this);
		var selector = ':input:visible:first';
		$this.findAndSelf(selector).focus();
		return this;
	};
	
	/**
	 * Gives target to the element, and removes target from everything else
	 * @version 1.0.0
	 * @date August 23, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.giveTarget = $.fn.giveTarget || function(){
		// Give focus to the current element
		var $this = $(this);
		$('.target').removeClass('target');
		$this.addClass('target');
		return this;
	};
	
	/**
	 * Perform the highlight effect
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.highlight = $.fn.highlight || function(duration){
		// Perform the Highlight Effect
		return $(this).effect('highlight', {}, duration||3000);
	};
	
	/**
	 * Get a elements html including it's own tag
	 * @version 1.0.1
	 * @date August 07, 2010
	 * @since 1.0.0, August 07, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.htmlAndSelf = $.fn.htmlAndSelf || function(){
		// Get a elements html including it's own tag
		return $(this).attr('outerHTML');
	};
	
	/**
	 * Prevent the default action when a click is performed
	 * @version 1.0.1
	 * @date August 31, 2010
	 * @since 1.0.0, August 19, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.preventDefaultOnClick = $.fn.preventDefaultOnClick || function(){
		return $(this).click(function(event){
			event.preventDefault();
			return false;
		});
	};
	
	/**
	 * Attempts to change the element type to {$type}
	 * @version 1.0.1
	 * @date August 07, 2010
	 * @since 1.0.0, August 07, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.attemptTypeChangeTo = $.fn.attemptTypeChangeTo || function(type){
		// Prepare
		var	$input = $(this),
			result = false,
			el = $input.get(0),
			oldType = el.type;
			
		// Handle
		if ( type === oldType ) {
			// Setting to the same
			result = true;
		}
		else if ( $input.is('input') ) {
			// We are in fact an input
			if ( !$.browser.msie ) {
				// We are not IE, this is due to bug mentioned here: http://stackoverflow.com/questions/1544317/jquery-change-type-of-input-field
				el.type = type;
				if ( el.type !== oldType ) {
					// It stuck, so we successfully applied the type
					result = true;
				}
			}
		}
		
		// Return result
		return result;
	};
	
})(jQuery);
/**
 * @depends jquery
 * @name jquery.events
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * Bind a event, with or without data
	 * Benefit over $.bind, is that $.binder(event, callback, false|{}|''|false) works.
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.binder = $.fn.binder || function(event, data, callback){
		// Help us bind events properly
		var $this = $(this);
		// Handle
		if ( (callback||false) ) {
			$this.bind(event, data, callback);
		} else {
			callback = data;
			$this.bind(event, callback);
		}
		// Chain
		return $this;
	};
	
	/**
	 * Bind a event only once
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.once = $.fn.once || function(event, data, callback){
		// Only apply a event handler once
		var $this = $(this);
		// Handle
		if ( (callback||false) ) {
			$this.unbind(event, callback);
			$this.bind(event, data, callback);
		} else {
			callback = data;
			$this.unbind(event, callback);
			$this.bind(event, callback);
		}
		// Chain
		return $this;
	};
	
	/**
	 * Event for pressing the enter key
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.enter = $.fn.enter || function(data,callback){
		return $(this).binder('enter',data,callback);
	};
	$.event.special.enter = $.event.special.enter || {
		setup: function( data, namespaces ) {
			$(this).bind('keypress', $.event.special.enter.handler);
		},
		teardown: function( namespaces ) {
			$(this).unbind('keypress', $.event.special.enter.handler);
		},
		handler: function( event ) {
			// Prepare
			var $el = $(this);
			// Setup
			var enterKey = event.keyCode === 13;
			if ( enterKey ) {
				// Our event
				event.type = 'enter';
				$.event.handle.apply(this, [event]);
				return true;
			}
			// Not our event
			return;
		}
	};
	
	/**
	 * Event for pressing the escape key
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.cancel = $.fn.cancel || function(data,callback){
		return $(this).binder('cancel',data,callback);
	};
	$.event.special.cancel = $.event.special.cancel || {
		setup: function( data, namespaces ) {
			$(this).bind('keyup', $.event.special.cancel.handler);
		},
		teardown: function( namespaces ) {
			$(this).unbind('keyup', $.event.special.cancel.handler);
		},
		handler: function( event ) {
			// Prepare
			var $el = $(this);
			// Setup
			var moz = typeof event.DOM_VK_ESCAPE === 'undefined' ? false : event.DOM_VK_ESCAPE;
			var escapeKey = event.keyCode === 27;
			if ( moz || escapeKey ) {
				// Our event
				event.type = 'cancel';
				$.event.handle.apply(this, [event]);
				return true;
			}
			// Not our event
			return;
		}
	};
	
	/**
	 * Event for the last click for a series of one or more clicks
	 * @version 1.0.0
	 * @date July 16, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.lastclick = $.fn.lastclick || function(data,callback){
		return $(this).binder('lastclick',data,callback);
	};
	$.event.special.lastclick = $.event.special.lastclick || {
		setup: function( data, namespaces ) {
			$(this).bind('click', $.event.special.lastclick.handler);
		},
		teardown: function( namespaces ) {
			$(this).unbind('click', $.event.special.lastclick.handler);
		},
		handler: function( event ) {
			// Setup
			var clear = function(){
				// Fetch
				var Me = this;
				var $el = $(Me);
				// Fetch Timeout
				var timeout = $el.data('lastclick-timeout')||false;
				// Clear Timeout
				if ( timeout ) {
					clearTimeout(timeout);
				}
				timeout = false;
				// Store Timeout
				$el.data('lastclick-timeout',timeout);
			};
			var check = function(event){
				// Fetch
				var Me = this;
				clear.call(Me);
				var $el = $(Me);
				// Store the amount of times we have been clicked
				$el.data('lastclick-clicks', ($el.data('lastclick-clicks')||0)+1);
				// Handle Timeout for when All Clicks are Completed
				var timeout = setTimeout(function(){
					// Fetch Clicks Count
					var clicks = $el.data('lastclick-clicks');
					// Clear Timeout
					clear.apply(Me,[event]);
					// Reset Click Count
					$el.data('lastclick-clicks',0);
					// Fire Event
					event.type = 'lastclick';
					$.event.handle.apply(Me, [event,clicks])
				},500);
				// Store Timeout
				$el.data('lastclick-timeout',timeout);
			};
			// Fire
			check.apply(this,[event]);
		}
	};
	
	/**
	 * Event for the first click for a series of one or more clicks
	 * @version 1.0.0
	 * @date July 16, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.firstclick = $.fn.firstclick || function(data,callback){
		return $(this).binder('firstclick',data,callback);
	};
	$.event.special.firstclick = $.event.special.firstclick || {
		setup: function( data, namespaces ) {
			$(this).bind('click', $.event.special.firstclick.handler);
		},
		teardown: function( namespaces ) {
			$(this).unbind('click', $.event.special.firstclick.handler);
		},
		handler: function( event ) {
			// Setup
			var clear = function(event){
				// Fetch
				var Me = this;
				var $el = $(Me);
				// Fetch Timeout
				var timeout = $el.data('firstclick-timeout')||false;
				// Clear Timeout
				if ( timeout ) {
					clearTimeout(timeout);
				}
				timeout = false;
				// Store Timeout
				$el.data('firstclick-timeout',timeout);
			};
			var check = function(event){
				// Fetch
				var Me = this;
				clear.call(Me);
				var $el = $(Me);
				// Update the amount of times we have been clicked
				$el.data('firstclick-clicks', ($el.data('firstclick-clicks')||0)+1);
				// Check we are the First of the series of many
				if ( $el.data('firstclick-clicks') === 1 ) {
					// Fire Event
					event.type = 'firstclick';
					$.event.handle.apply(Me, [event])
				}
				// Handle Timeout for when All Clicks are Completed
				var timeout = setTimeout(function(){
					// Clear Timeout
					clear.apply(Me,[event]);
					// Reset Click Count
					$el.data('firstclick-clicks',0);
				},500);
				// Store Timeout
				$el.data('firstclick-timeout',timeout);
			};
			// Fire
			check.apply(this,[event]);
		}
	};
	
	/**
	 * Event for performing a singleclick
	 * @version 1.1.0
	 * @date July 16, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.fn.singleclick = $.fn.singleclick || function(data,callback){
		return $(this).binder('singleclick',data,callback);
	};
	$.event.special.singleclick = $.event.special.singleclick || {
		setup: function( data, namespaces ) {
			$(this).bind('click', $.event.special.singleclick.handler);
		},
		teardown: function( namespaces ) {
			$(this).unbind('click', $.event.special.singleclick.handler);
		},
		handler: function( event ) {
			// Setup
			var clear = function(event){
				// Fetch
				var Me = this;
				var $el = $(Me);
				// Fetch Timeout
				var timeout = $el.data('singleclick-timeout')||false;
				// Clear Timeout
				if ( timeout ) {
					clearTimeout(timeout);
				}
				timeout = false;
				// Store Timeout
				$el.data('singleclick-timeout',timeout);
			};
			var check = function(event){
				// Fetch
				var Me = this;
				clear.call(Me);
				var $el = $(Me);
				// Update the amount of times we have been clicked
				$el.data('singleclick-clicks', ($el.data('singleclick-clicks')||0)+1);
				// Handle Timeout for when All Clicks are Completed
				var timeout = setTimeout(function(){
					// Fetch Clicks Count
					var clicks = $el.data('singleclick-clicks');
					// Clear Timeout
					clear.apply(Me,[event]);
					// Reset Click Count
					$el.data('singleclick-clicks',0);
					// Check Click Status
					if ( clicks === 1 ) {
						// There was only a single click performed
						// Fire Event
						event.type = 'singleclick';
						$.event.handle.apply(Me, [event])
					}
				},500);
				// Store Timeout
				$el.data('singleclick-timeout',timeout);
			};
			// Fire
			check.apply(this,[event]);
		}
	};
	

})(jQuery);
/**
 * @depends jquery
 * @name jquery.utilities
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * Creates a new object, which uses baseObject's structure, and userObject's values when applicable
	 * @params {Object} baseObject
	 * @params {Object} userObject
	 * @params {Object} ...
	 * @return {Object} newObject
	 * @version 1.0.0
	 * @date August 01, 2010
	 * @since 1.0.0
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.prepareObject = $.prepareObject || function(baseObject,userObject) {
		var newObject = {};
		var skipValue = '$.prepareObject.skipValue';
		
		// Extend newObject
		$.extend(newObject,baseObject||{});
		
		// Intercept with the userObject
		$.intercept(true,newObject,userObject);
		
		// Handle additional params
		var objects = arguments;
		objects[0] = objects[1] = skipValue;
		
		// Cycle through additional objects
		$.each(objects,function(i,object){
			// Check if we want to skip
			if ( object === skipValue ) return true; // continue
			// Intercept with the object
			$.intercept(true,newObject,object);
		});
		
		// Return the newObject
		return newObject;
	};
	
	/**
	 * Intercept two objects
	 * @params [deep], &object1, object2, ...
	 * @version 1.0.0
	 * @date August 01, 2010
	 * @since 1.0.0
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.intercept = $.intercept || function() {
		// Prepare
		var objects = arguments,
			object,
			deep = false,
			copy = false;
		var skipValue = '$.intercept.skipValue';
		
		// Check Deep
		if ( typeof objects[0] === 'boolean' ) {
			deep = objects[0];
			objects[0] = skipValue;
			// Check Copy
			if ( typeof objects[1] === 'boolean' ) {
				copy = objects[1];
				objects[1] = skipValue;
				// Handle Copy
				if ( copy ) {
					object = {};
				}
				else {
					object = objects[2];
					objects[2] = skipValue;
				}
			}
			else {
				object = objects[1];
				objects[1] = skipValue;
			}
		}
		else {
			object = objects[0];
			objects[0] = skipValue;
		}
		
		// Grab Keys
		var keys = {};
		$.each(object,function(key){
			keys[key] = true;
		});
		
		// Intercept Objects
		if ( deep ) {
			// Cycle through objects
			$.each(objects, function(i,v){
				// Check if we want to skip
				if ( v === skipValue ) return true; // continue
				// Cycle through arguments
				$.each(v, function(key,value){
					// Check if the key exists so we can intercept
					if ( typeof keys[key] === 'undefined' ) return true; // continue
					// It exists, check value type
					if ( typeof value === 'object' && !(value.test||false && value.exec||false) ) {
						// Extend this object
						$.extend(object[key],value||{});
					}
					else {
						// Copy value over
						object[key] = value;
					}
				});
			})
		}
		else {
			// Cycle through objects
			$.each(objects, function(i,v){
				// Cycle through arguments
				$.each(v, function(key,value){
					// Check if the key exists so we can intercept
					if ( typeof keys[key] === 'undefined' ) return true; // continue
					// It exists, check value type
					if ( typeof value === 'object' && !(value.test||false && value.exec||false) ) {
						// Intercept this object
						$.intercept(true,object[key],value);
					}
					else {
						// Copy value over
						object[key] = value;
					}
				});
			})
		}
		
		// Return object
		return object;
	};
	
	/**
	 * Handle a Promise
	 * @param {Object} options.object
	 * @param {String} options.handlers
	 * @param {String} options.flag
	 * @param {Funtion} options.handler
	 * @return {Boolean} Whether or not the promise is ready
	 * @version 1.0.0
	 * @date August 31, 2010
	 * @since 1.0.0
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	$.promise = $.promise || function(options){
		// Extract
		var	object = options.object||this;
		
		// Check
		if ( typeof object[options.handlers] === 'undefined' ) {
			object[options.handlers] = [];
		}
		if ( typeof object[options.flag] === 'undefined' ) {
			object[options.flag] = false;
		}
		
		// Extract
		var	handlers = object[options.handlers],
			flag = object[options.flag],
			handler = options.arguments[0];
		
		// Handle
		switch ( typeof handler ) {
			case 'boolean':
				// We want to set the flag as true or false, then continue on
				flag = object[options.flag] = handler;
				// no break, as we want to continue on
				
			case 'undefined':
				// We want to fire the handlers, so check if the flag is true
				if ( flag && handlers.length ) {
					// Fire the handlers
					$.each(handlers, function(i,handler){
						handler.call(object);
					});
					// Clear the handlers
					object[options.handlers] = [];
				}
				break;
			
			case 'function':
				// We want to add or fire a handler, so check the flag
				if ( flag ) {
					// Fire the event handler
					handler.call(object);
				}
				else {
					// Add to the handlers
					object[options.handlers].push(handler);
				}
				break;
			
			default:
				window.console.error('Unknown arguments for $.promise', [this, arguments]);
				break;
		}
	
		// Return flag
		return flag;
	}
	
})(jQuery);
/**
 * @depends jquery
 * @name jquery.passwordstrength
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * String.prototype.passwordStrength
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	String.prototype.passwordstrength = String.prototype.passwordstrength || function(confirm,username){
		var password = this.toString(), symbolSize = 0, natLog, score;
		confirm = confirm||'';
		username = username||'';
	
		// Short
	    if ( password.length < 4 ) {
			return "short";
		};
	
	    // Username
	    if ( username.length && password.toLowerCase() == username.toLowerCase()) {
			return "username";
		}
	
	    // Confirm
	    if ( confirm.length && password != confirm ) {
			return "mismatch";
		}
	
		// Strength
		if ( password.match(/[0-9]/) ) symbolSize +=10;
		if ( password.match(/[a-z]/) ) symbolSize +=26;
		if ( password.match(/[A-Z]/) ) symbolSize +=26;
		if ( password.match(/[^a-zA-Z0-9]/) ) symbolSize +=31;
	
		// Score
		natLog = Math.log( Math.pow(symbolSize,password.length) );
		score = natLog / Math.LN2;
	
		// Check
		if (score < 40 ) {
			return "low";
		}
		else if (score < 56 ) {
			return "medium";
		}
	
		// Strong
		return "high";
	};

	/**
	 * jQuery Password Strength
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	if ( !($.fn.passwordstrength||false) ) {
		$.fn.passwordstrength = function(options) {
			// Prepare
			var passwordstrength = $.fn.passwordstrength;
			passwordstrength.config = passwordstrength.config || {
				content: '<div class="sparkle-passwordstrength-result"></div><div class="sparkle-passwordstrength-description"></div>',
				contentSelectors: {
					result: '.sparkle-passwordstrength-result',
					description: '.sparkle-passwordstrength-description'
				},
				strengthCss: {
					"short": "invalid",
					mismatch: "invalid",
					username: "invalid",
					low: "low",
					medium: "medium",
					high: "high",
					empty: ""
				},
				il8n: {
					description: "Hint: The password should be have a strength of at least medium. To make it stronger, use upper and lower case letters, numbers and symbols like ! \" ? $ % ^ &amp; ).",
					empty: "Strength indicator",
					username: "Password should not match username",
					mismatch: "Confirm password does not match",
					"short": "Password is too short",
					low: "Weak",
					medium: "Medium",
					high: "Strongest"
				}
			};
			var config = $.extend({}, passwordstrength.config);
	
			// Options
			$.extend(true, config, options);
	
			// Fetch
			var $this = $(this);
			var $container = $this.html(config.content).hide();
	
			// Implode
			var $result = $container.find(config.contentSelectors.result);
			var $description = $container.find(config.contentSelectors.description).html(config.il8n.description);
			if ( !config.il8n.description ) {
				$description.remove();
			}
	
			// Prepare
			var classes = [
				config.strengthCss["short"],
				config.strengthCss.mismatch,
				config.strengthCss.username,
				config.strengthCss.low,
				config.strengthCss.medium,
				config.strengthCss.high,
				config.strengthCss.empty
			].join(' ');
	
			// Fetch
			var $password = $(config.password),
				$confirm = $(config.confirm||null),
				$username = $(config.username||null);
	
			// Apply
			var check = function(){
				// Fetch
				var password = $password.val(),
					confirm  = $confirm.val(),
					username = $username.val();
	
				// Strength
				var strength = password ? password.passwordstrength(confirm,username) : "empty";
				var strength_css = config.strengthCss[strength];
				var strength_text = config.il8n[strength];
	
				// Apply
				$result.removeClass(classes).addClass(strength_css).html(strength_text);
			};
			$password
				.keyup(function(){
					var $password = $(this);
					$confirm.val('');
					if ( $password.val() !== '' && !$container.data('shown') ) {
						$container.animate({'height':'show','opacity':'show'},'slow').data('shown',true);
					}
				});
			$password.add($confirm).add($username).keyup(check);
			check();
	
			// Chain
			return $this;
		}
	}
	else {
		window.console.warn("$.fn.passwordstrength has already been defined...");
	}
	

})(jQuery);/**
 * @depends jquery, core.console
 * @name jquery.balclass
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * BalClass
	 * @version 1.5.0
	 * @date August 28, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	if ( !($.BalClass||false) ) {
		// Constructor
		$.BalClass = function(extend){
			this.construct(extend);
		};
		// Prototype
		$.extend($.BalClass.prototype, {
			config: {
			},
			construct: function(){
				var Me = this,
					extend = {};
				// Handle
				if ( typeof arguments[0] === 'object' && typeof arguments[1] === 'object'  ) {
					// config, extend
					extend = arguments[1];
					extend.config = arguments[0]||{};
				}
				else if ( typeof arguments[0] === 'object' ) {
					// extend
					extend = arguments[0];
					extend.config = extend.config||{};
				}
				else if ( typeof arguments[0] === 'undefined' ) {
					// No arguments were passed
					extend = false;
				}
				else {
					window.console.error('BalClass.construct: Invalid Input');
				}
				
				// Check
				if ( extend !== false ) {
					// Configure
					Me.configure(extend.config);
					delete extend.config;
				
					// Extend
					$.extend(Me,extend);
				}
				
				// Build
				if ( typeof Me.built === 'function' ) {
					return Me.built();
				}
				
				// Return true
				return true;
			},
			configure: function(config){
				var Me = this;
				Me.config = Me.config||{};
				Me.config = $.extend({},Me.config,config||{}); // we want to clone
				return Me;
			},
			clone: function(extend){
				// Clone a BalClass (Creates a new BalClass type)
				var Me = this;
				var clone = function(extend){
					this.construct(extend);
				};
				$.extend(clone.prototype, Me.prototype, extend||{});
				clone.clone = clone.prototype.clone;
				clone.create = clone.prototype.create;
				return clone;
			},
			create: function(Extension){
				// Create a BalClass (Creates a new instance of a BalClass)
				var Me = this;
				var Obj = new Me(Extension);
				return Obj;
			},
			addConfig: function(name, config){
				var Me = this;
				if ( typeof config === 'undefined' ) {
					if ( typeof name === 'object' ) {
						// Series
						$.each(name,function(key,value){
							Me.applyConfig(key, value);
						});
					}
					return false;
				} else if ( typeof config === 'object' ) {
					// Single
					Me.applyConfig(name, config);
				}
				return Me;
			},
			applyConfig: function(name,config){
				var Me = this;
				Me.config[name] = Me.config[name]||{};
				$.extend(true,Me.config[name],config||{});
				return Me;
			},
			setConfig: function(name,config){
				var Me = this;
				Me.config[name] = config||{};
				return Me;
			},
			hasConfig: function(name){
				var Me = this;
				return typeof Me.config[name] !== 'undefined';
			},
			getConfig: function(name){
				var Me = this;
				if ( typeof name !== 'string' ) {
					return this.config;
				}
				return this.getConfigWith(name);
			},
			getConfigWith: function(name,config){
				var Me = this;
				if ( typeof name !== 'string' ) {
					if ( typeof config === 'undefined' ) {
						config = name;
					}
					name = 'default';
				}
				if ( typeof config !== 'object' ) {
					config = {};
				}
				var result = {};
				$.extend(true, result, Me.config[name]||{}, config||{});
				return result;
			},
			getConfigWithDefault: function(name,config){
				var Me = this;
				return Me.getConfigWith('default',Me.getConfigWith(name,config));
			},
			setDefaults: function(config){
				var Me = this;
				return Me.applyConfig('default',config);
			}
		});
		// Instance
		$.BalClass.clone = $.BalClass.prototype.clone;
		$.BalClass.create = $.BalClass.prototype.create;
		// ^ we alias these as they should be both in prototype and instance
		//   however we do not want to create a full instance yet...
	}
	else {
		window.console.warn("$.BalClass has already been defined...");
	}


})(jQuery);/**
 * @depends jquery, core.console, jquery.balclass, bespin
 * @name jquery.balclass.bespin
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery Bespin Extender
	 * @version 1.2.1
	 * @date August 20, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	if ( !($.Bespin||false) ) {
		$.Bespin = $.BalClass.create({
			// Configuration
			config: {
				"default": {
					"content": null,
					"bespin": {
						"settings": {
							"tabstop": 4
						}
					},
					"toolbar": {
						"fullscreen": true
					}
				},
				"rich": {
					"bespin": {
						"syntax": "html"
					}
				},
				"html": {
					"bespin": {
						"syntax": "html"
					}
				},
				"plain": {
					"toolbar": false
				}
			},
			// Functions
			fn: function(mode, options) {
				// Prepare
				var Me = $.Bespin;
				var config = Me.getConfigWithDefault(mode,options);

				// Elements
				var element = this;

				// Bespin
				var onBespinLoad = function(){
					// Use Bespin
					Me.useBespin(element, config);
				};
				$(window).bind('onBespinLoad', onBespinLoad);
				
				// Events
				var events = {
					onBespinLoad: function(){
						$(window).trigger('onBespinLoad');
					}
				};
				
				// Check Loaded
				if ( bespin.bootLoaded ) {
					// Fire Event
					setTimeout(function(){
						events.onBespinLoad();
					},500);
				}
				else {
					// Add Event
					window.onBespinLoad = events.onBespinLoad;
				}
				// ^ we have this check as if bespin has already loaded, then the onBespinLoad will never fire!
				
				// Chain
				return this;
			},
			useBespin: function(element, config) {
				// Prepare
				var Me = $.Bespin;

				// Elements
				var $element = $(element),
					$bespin,
					bespin_id;

				// Check
				if ( $element.is('textarea') ) {
					// Editor is a textarea
					// So we have to create a div to use as our bespin editor
					// Update id
					bespin_id = $element.attr('id')+'-bespin';
					// Create div
					$bespin = $('<div id="'+bespin_id+'"/>').html($element.val()).css({
						height: $element.css('height'),
						width: $element.css('width')
					});
					// Insert div
					$bespin.insertAfter($element);
					// Hide textarea
					$element.hide();
				}
				else {
					// Editor is likely a div
					// So we can use that as our bespin editor
					$bespin = $element;
					bespin_id = $bespin.attr('id');
				}

				// Use Bespin
				bespin.useBespin(bespin_id,config.bespin).then(
					function(env){
						// Success
						Me.postBespin(bespin_id, env, config);
					},
					function(error){
						// Error
						window.console.error("Bespin Launch Failed: " + error);
					}
				);

				// Chain
				return this;
			},
			postBespin: function(bespin_id, env, config) {
				// Prepare
				var Me = $.Bespin;

				// Elements
				var $bespin = $('#'+bespin_id);
				var $textarea = $bespin.siblings('textarea');
				var editor = env.editor;

				// Ensure overflow is set to hidden
				// stops bespin from having text outside it's box in rare circumstances
				$bespin.css('overflow','hidden');

				// Wrap our div
				$bespin.wrap('<div class="bespin-wrap" />');
				var $bespin_wrap = $bespin.parent();

				// Update Textarea on submit
				if ( $textarea.length ) {
					var updateFunction = function(){
						var val = editor.value;
						$textarea.val(val);
					};
					$textarea.parents('form:first').submit(updateFunction);
				}

			  		// Change the value
				if ( config.content || config.content === '' ) {
					editor.value = config.content;
				}

				// Toolbar
				if ( config.toolbar||false ) {
					var $toolbar = $('<div class="bespin-toolbar" />');
					$toolbar.insertBefore($bespin);
	
					// Fullscreen
					if (config.toolbar.fullscreen||false ) {
						var $fullscreen = $('<span class="bespin-toolbar-fullscreen" title="Toggle Fullscreen"></span>');
						$fullscreen.appendTo($toolbar);
						$fullscreen.click(function(){
							if ( $bespin_wrap.hasClass('bespin-fullscreen') ) {
								// Destroy fullscreen
								$('body').add($bespin_wrap).removeClass('bespin-fullscreen');
							}
							else {
								// Make fullscreen
								$('body').add($bespin_wrap).addClass('bespin-fullscreen');
							}
							env.dimensionsChanged();
						});
					}
				}

				// Chain
				return this;
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.Bespin = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});
	}
	else {
		window.console.warn("$.Bespin has already been defined...");
	}


})(jQuery);/**
 * @depends jquery, core.console, jquery.balclass
 * @name jquery.balclass.datepicker
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery Date Picker
	 * @version 1.0.1
	 * @date August 20, 2010
	 * @since 1.0.0, August 18, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	if ( !($.Datepicker||false) ) {
		$.Datepicker = $.BalClass.create({
			// Configuration
			config: {
				'default': {
					useHtml5: false
				}
			},
			// Functions
			fn: function(mode,options){
				// Prepare
				var Me = $.Datepicker;
				var config = Me.getConfigWithDefault(mode,options);
				// Handle
				return $(this).each(function(){
					var $input = $(this);
	
					// Prepare
					if ( $input.hasClass('sparkle-date-has') ) {
						// Already done
						return this;
					}
					$input.addClass('sparkle-date').addClass('sparkle-date-has');
					
					// HTML5
					if ( config.useHtml5 && Modernizr && Modernizr.inputtypes.date && $input.attemptTypeChangeTo('date') ) {
						// Chain
						return this;
					}
					
					// Instantiate
					$input.datepicker(config);
					
					// Chain
					return this;
				});
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.Datepicker = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});
	}
	else {
		window.console.warn("$.Datepicker has already been defined...");
	}

	
})(jQuery);/**
 * @depends jquery, core.console, jquery.balclass
 * @name jquery.balclass.datetimepicker
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery Date Time Picker
	 * @version 1.3.1
	 * @date August 20, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	if ( !($.Datetimepicker||false) ) {
		$.Datetimepicker = $.BalClass.create({
			// Configuration
			config: {
				'default': {
					useHtml5: false,
					datepickerOptions: {
					},
					timepickerOptions: {
					}
				},
				'12hr': {
					timepickerOptions: {
						timeConvention: 12
					}
				},
				'24hr': {
					timepickerOptions: {
						timeConvention: 24
					}
				}
			},
			// Functions
			fn: function(mode,options){
				// Prepare
				var Me = $.Datetimepicker;
				var config = Me.getConfigWithDefault(mode,options);
				// Handle
				return $(this).each(function(){
					var $input = $(this);
	
					// Prepare
					if ( $input.hasClass('sparkle-datetime-has') ) {
						// Already done
						return this;
					}
					$input.addClass('sparkle-datetime').addClass('sparkle-datetime-has');
					
					// HTML5
					if ( config.useHtml5 && Modernizr && Modernizr.inputtypes.datetime && $input.attemptTypeChangeTo('datetime') ) {
						// Chain
						return this;
					}
					
					// --------------------------
					
					// Defaults
					var value = $input.val();
					var date = new Date();
					var datestr = '', timestr = '';
					if ( value ) {
						date.setDatetimestr(value);
						datestr = date.getDatestr();
						timestr = date.getTimestr();
					}
					
					// --------------------------
					// DOM Manipulation
					
					// Hide
					$input.hide();
					
					// Create date part
					var $date = $('<input type="text" class="sparkle-date"/>');
					var $sep = $('<span class="sparkle-datetime-sep"> @ </span>');
					var $time = $('<input type="text" class="sparkle-time"/>');
					
					// Append
					$time.insertAfter($input);
					$sep.insertAfter($input);
					$date.insertAfter($input);
	
					// Apply
					$date.val(datestr);
					$time.val(timestr);
	
					// --------------------------
					
					// Bind
					var updateFunction = function(){
						var value = $date.val()+' '+$time.val();
						$input.val(value).trigger('change');
					};
					$date.add($time).change(updateFunction);
	
					// Instantiate
					$date.Datepicker(config.datepickerOptions);
					$time.Timepicker(config.timepickerOptions);
	
					// Chain
					return $input;
				});
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.datetimepicker = $.fn.Datetimepicker = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});
	}
	else {
		window.console.warn("$.Datetimepicker has already been defined...");
	}

	
})(jQuery);/**
 * @depends jquery, core.console, jquery.balclass
 * @name jquery.balclass.eventcalendar
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * Event Calendar
	 * @version 1.2.1
	 * @date August 20, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	if ( !($.EventCalendar||false) ) {
		$.EventCalendar = $.BalClass.create({
			// Configuration
			config: {
				// Default Mode
				"default": {
					// Ajax Variables
					/** The JSON variable that will be return on the AJAX request which will contain our entries */
					ajaxEntriesVariable: 'entries',
					/** The AJAX url to request for our entries */
					ajaxEntriesUrl: '',
					/** The JSON Object to send via POST to our AJAX request */
					ajaxPostData: {},
					/** Whether or not to Cache the AJAX data */
					ajaxCache: true,
				
					// Data Variables
					/* If you are not using AJAX, you can define your entries here */
					calendarEntries: [],
				
					// Customisation Variables
					/** The CSS class which will be assigned to the Event Calendar */
					calendarClass: 'hasEventCalendar',
					/** The CSS class which will be assigned to day when the day contains a entry */
					dayEventClass: 'ui-state-active hasEvent',
					/** The standard options to send to the datepicker */
					datepickerOptions: {},
					/** Whether or not to disable the datepicker date selection click */
					disableClick: true,
					/**
					 * Whatever events you would like to assign to a $day
					 * You will recieve the arguments: domEvent, day, dayEntries, entries
					 */
					domEvents: {}
				}
			},
			// Functions
			/**
			 * jQuery Object Function
			 */
			fn: function(mode,options){
				var EventCalendar = $.EventCalendar;
				
				// Group?
				var $calendar = $(this);
				if ( $calendar.length > 1 ) {
					$calendar.each(function(){
						$(this).EventCalendar(mode,options);
					});
					return this;
				}
				
				// Prepare
				var Me = $.EventCalendar;
				var config = Me.getConfigWithDefault(mode,options);
				
				// Initialise
				var Entries = {
					/**
					 * Calendar Entries Stored by {entryId:entry}
					 */
					entriesById: {},
					
					/**
					 * Calendar Entries Stored by {"year-month":[entry,entry]}
					 */
					entriesByYearMonth: {},
					
					/**
					 * Whether or not the "year-month" is cacheable
					 */
					cacheableByYearMonth: {},
					
					/**
					 * Get whether or not a "year-month" is cacheable
					 */
					isCacheable: function(year,month,value){
						return (this.cacheableByYearMonth[year+'-'+month]||false) ? true : false;
					},
					
					/**
					 * Set whether or not a "year-month" is cacheable
					 */
					setCacheable: function(year,month,value){
						if ( typeof value === 'undefined' ) value = 
						this.cacheableByYearMonth[year+'-'+month] = value;
						return this;
					},
					
					/**
					 * Calendar Entries Undefined
					 */
					isYearMonthSet: function(year,month) {
						return typeof this.entriesByYearMonth[year+'-'+month] !== 'undefined';
					},
					
					/**
					 * Calendar Entries Empty
					 */
					isYearMonthEmpty: function(year,month) {
						var notempty =
							(typeof this.entriesByYearMonth[year+'-'+month] === 'array' && this.entriesByYearMonth[year+'-'+month].length !== 0) ||
							(typeof this.entriesByYearMonth[year+'-'+month] === 'object' && !$.isEmptyObject(this.entriesByYearMonth[year+'-'+month]))
						;
						return !notempty;
					},
					
					/**
					 * Calendar Entries Getter
					 */
					getEntriesByYearMonth: function(year,month) {
						return this.entriesByYearMonth[year+'-'+month]||[];
					},
					
					/**
					 * Calendar Entries Getter
					 */
					getEntryById: function(id) {
						return this.entriesById[id]||undefined;
					},
					
					/**
					 * Get Days in a Month by passing a date
					 */
					getDaysInMonth: function(date){
						// http://snippets.dzone.com/posts/show/2099
						return 32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate();
					},
					
					/**
					 * Get Date
					 */
					getDate: function(timestamp){
						// Convert
						var date;
						if ( typeof timestamp === 'string' ) {
							date = new Date(timestamp);
						}
						else if ( typeof timestamp === 'number' ) {
							date = new Date();
							date.setTime(timestamp);
						}
						else if ( typeof timestamp === 'object' ) {
							date = new Date();
							date.setTime(timestamp.getTime());
						}
						else {
							throw Error("Unknown date format.");
						}
						
						// Fix for Firefox
						if ( isNaN(date) || date.toString() === "Invalid Date" ) {
							date = new Date();
							date.setDatetimestr(timestamp);
						}
						
						// Return date
						return date;
					},

					/**
					 * Calendar Entries Setter
					 */
					addEntries: function(entries) {
						// Prepare
						var Me = this;
						
						// Add
						$.each(entries,function(index,entry){
							// Prepare
							entry.id = entry.id||index;
							
							// Add Entry
							Me.addEntry(entry);
						});
						
						// Chain
						return true;
					},
					
					/**
					 * Calendar Entries Setter
					 */
					addEntry: function(entry) {
						// Prepare entry
						entry.start = this.getDate(entry.start);
						entry.finish = this.getDate(entry.finish);
						
						// Cycle through years and months
						var currentDate = this.getDate(entry.start);
						currentDate.setDate(1); currentDate.setHours(0); currentDate.setMinutes(0); currentDate.setSeconds(0); currentDate.setMilliseconds(0);
						var finishDate = this.getDate(entry.finish);
						finishDate.setDate(2); finishDate.setHours(0); finishDate.setMinutes(0); finishDate.setSeconds(0); finishDate.setMilliseconds(0);
						while ( currentDate < finishDate ) {
							// Fetch
							var year = currentDate.getFullYear(),
								month = currentDate.getMonth()+1;
							
							/*
							// Add
							entry.span = entry.span||{};
							entry.span[year] = entry.span[year]||{};
							entry.span[year][month] = entry.span[year][month]||{};
							
							// Cycle through days
							// Determine span
							var firstMonth = (year === entry.start.getFullYear() && month === entry.start.getMonth()+1),
								lastMonth = (year === entry.finish.getFullYear() && month === entry.finish.getMonth()+1),
								daysInMonth = this.getDaysInMonth(currentDate);
							// Ifs
							if ( firstMonth && lastMonth ) {
								// First + Last
								// Get days between (inclusive)
								var startDay = entry.start.getDate(),
									finishDay = entry.finish.getDate();
							else if (  ) {
								// First
								// Get days from (inclusive)
								var startDay = entry.start.getDate(),
									finishDay = daysInMonth;
							}
							else if (  ) {
								// Last
								// Get days to (inclusive)
								var startDay = 1,
									finishDay = entry.finish.getDate();
							}
							else {
								// Intermediate
								// Get all days
								var startDay = 1,
									finishDay = daysInMonth;
							}
							// Apply
							for ( var day = startDay; day<=finishDay; ++day ) {
								entry.span[year][month][day] = true;
							}
							*/
							
							// Add to Year-Month Indexed
							if ( typeof this.entriesByYearMonth[year+'-'+month] === 'undefined' ) {
								this.entriesByYearMonth[year+'-'+month] = {};
							}
							this.entriesByYearMonth[year+'-'+month][entry.id] = entry;
							
							// Increment date by one month
							if ( month === 11 ) {
								currentDate.setMonth(0);
								currentDate.setYear(year+1);
							}
							else {
								currentDate.setMonth(month+1);
							}
						}
						
						// Add to ID Indexed
						this.entriesById[entry.id] = entry;
						
						// Return entry
						return entry;
					}
				};
				
				// Add the passed entries (if any)
				Entries.addEntries(config.calendarEntries);
				
				// Our Extender Event
				var calendarEntriesRender = function(datepicker, year, month) {
					// Fetch the Entries
					var monthEntries = Entries.getEntriesByYearMonth(year,month),
						$datepicker = $(datepicker);
					
					// Reset the Render
					var $days_tds = $datepicker.find('tbody td'),
						$days = $days_tds.find('a');
	
					// Disable Click
					if ( config.disableClick ) {
						$days_tds.unbind('click').removeAttr('onclick');
						$days.removeAttr('href').css('cursor','default');
					}
	
					// Cycle Through Entries
					$.each(monthEntries, function(entryIndex,entry){
						// Fetch stat and finish days
						var startMonth = entry.start.getMonth()+1,
						 	finishMonth = entry.finish.getMonth()+1,
							startDay = entry.start.getDate(),
							finishDay = entry.finish.getDate();
						
						// Determine start and finish days in the rendered calendar
						var $startDay = startMonth == month ? $days.filter(':contains('+startDay+'):first') : $days.filter(':first'),
							$finishDay = finishMonth == month ? $days.filter(':contains('+finishDay+'):first') : $days.filter(':last');
						
						// Determine the indexes
						var start = startMonth == month ? $days.index($startDay) : 0,
							finish = finishMonth == month ? $days.index($finishDay) : $days.length-1,
							duration = finish-start+1; // +1 to be inclusive
						
						// Betweens
						var $entryDays = [];
						if ( start == finish ) {
							$entryDays = $startDay;
						} else if ( start == finish-1 ) {
							$entryDays = $startDay.add($finishDay);
						} else {
							$entryDays = $startDay.add($days.filter(':lt('+(finish)+')').filter(':gt('+(start)+')')).add($finishDay);
						}
						
						// Add the Entry to These Days
						$entryDays.addClass(config.dayEventClass).each(function(dayIndex,dayElement){
							// Fetch
							var $day = $(dayElement),
								day = $day.text().trim(),
								dayEntriesIds = $day.data('dayEntriesIds');
			
							// Handle
							if ( typeof dayEntriesIds === 'undefined' ) {
								dayEntriesIds = entry.id;
							} else {
								dayEntriesIds = String(dayEntriesIds).split(/,/g);
								dayEntriesIds.push(entry.id);
								dayEntriesIds = dayEntriesIds.join(',');
							}
			
							// Apply
							$day.data('dayEntriesIds',dayEntriesIds);
			
							// Bind Entries
							$.each(config.domEvents,function(domEventName,domEventHandler){
								$day.unbind(domEventName).bind(domEventName,function(domEvent){
									// Prepare
									var $day = $(this),
										day = $day.text().trim(),
										dayEntriesIds = String($day.data('dayEntriesIds')).split(/,/g),
										date = new Date(); date.setDatestr(year+'-'+month+'-'+day);
									
									// Entries
									var dayEntries = []
									$.each(dayEntriesIds,function(i,entryId){
										var dayEntry = Entries.getEntryById(entryId);
										dayEntries.push(dayEntry);
									});
									
									// Fire
									domEventHandler.apply(this, [domEvent, {
										"year":year,
										"month":month,
										"day":day,
										"date":date,
										"dayEntries":dayEntries,
										"monthEntries":monthEntries,
										"datepicker":datepicker
									}]);
									
									// Done
									return true;
								});
							});
			
							// Done
						});
					});
	
					// Done
					return true;
				};
				
				// Change Month Year
				var calendarChangeMonthYear = function(year, month, inst) {
					// Prepare
					var datepicker = inst.dpDiv||inst;
					
					// Check
					if ( typeof config.ajaxEntriesUrl === 'string' && config.ajaxEntriesUrl.length ) {
						// Ajax Enabled
						if ( config.ajaxCache && Entries.isCacheable(year,month) && !Entries.isYearMonthEmpty(year,month) ) {
							// We can use the cache
							// And we have entries
							setTimeout(function(){
								calendarEntriesRender(datepicker, year, month)
							},50);
						}
						else {
							// Prepare
							var data = $.extend({},{
									year: year,
									month: month
								},
								config.ajaxPostData
							);
							// Fetch into the cache
							$.ajax({
								"url":  config.ajaxEntriesUrl,
								"method": 'post',
								"dataType": 'json',
								"data": data,
								success: function(data, status){
									// Cycle
									var entries = data[config.ajaxEntriesVariable]||[];
									
									// Enable caching for this year month
									Entries.setCacheable(year,month,true)
									
									// Check if we have entries
									if ( entries.length === 0 ) {
										return true;
									}
								
									// Store the Entries in the Calendar Data
									Entries.addEntries(entries);
								
									// Render the year and month, as we have new data
									setTimeout(function(){
										calendarEntriesRender(datepicker, year, month)
									},50);
									
									// Done
									return true;
								},
								error: function(XMLHttpRequest, textStatus, errorThrown, response_data){
									// Error
									window.console.warn('$.EventCalendar.calendarChangeMonthYear.ajax.error:', [this, arguments]);
								}
							});
						}
					}
					else if ( !Entries.isYearMonthEmpty(year,month) ) {
						// We are not using cache
						// And we have entries
						setTimeout(function(){
							calendarEntriesRender(datepicker, year, month)
						},50);
					}
					
					// Done
					return true;
				};
				
				// Prepare initial render
				var calendarInitialised = false;
				var calendarInit = function(year,month,inst){
					// Prepare
					if ( calendarInitialised ) return;
					calendarInitialised = true;
					// Apply
					$(inst).addClass(config.calendarClass);
					calendarChangeMonthYear(year, month, inst);
				};
				
				// Calendar Options
				var datepickerOptions = $.extend({}, config.datepickerOptions, {
					onChangeMonthYear: function(year, month, inst) {
						// Our Event
						calendarChangeMonthYear(year,month,inst);
						// Users' Event
						if ( typeof config.datepickerOptions.onChangeMonthYear === 'function' ) {
							calendarInit(year,month,inst);
						}
					},
					beforeShow: function(input, inst) {
						datepickerShowed = true;
						// Users' Event
						if ( typeof config.datepickerOptions.beforeShow === 'function' ) {
							config.datepickerOptions.beforeShow.apply(this,[input,inst]);
						}
						// Our Event
						setTimeout(function(){
							calendarInit(inst.drawYear, inst.drawMonth+1, inst);
						},1000);
					}
				});
				
				// Apply Options so we can hook into the events
				$calendar.datepicker(datepickerOptions);

				// Fallback in case beforeShow fails us
				setTimeout(function(){
					var date = $calendar.datepicker("getDate");
					calendarInit(date.getFullYear(), date.getMonth()+1, $calendar);
				},2000);
				
				// Chain
				return $calendar;
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.EventCalendar = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});
	}
	else {
		window.console.warn("$.EventCalendar has already been defined...");
	}


})(jQuery);/**
 * @depends jquery, core.console, jquery.balclass
 * @name jquery.balclass.help
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery Help
	 * @version 1.2.1
	 * @date August 20, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	if ( !($.Help||false) ) {
		$.Help = $.BalClass.create({
			// Configuration
			config: {
				'default': {
					// Elements
					wrap: '<span class="sparkle-help-wrap"/>',
					icon: '<span class="sparkle-help-icon"/>',
					text: '<span class="sparkle-help-text"/>',
					parentClass: '',
					title: ''
				}
			},
			// Functions
			fn: function(options){
				var Me = $.Help;
				if ( typeof options === 'string' ) {
					options = {
						title: options
					};
				}
				var config = Me.getConfigWithDefault('default',options);
				// Fetch
				var $this = $(this);
				var $wrap = $(config.wrap);
				var $icon = $(config.icon);
				var $text = $(config.text);
				var $parent = $this.parent().addClass(config.parentClass);
				// Build
				var $contents = $this.contents();
				$this.append($wrap.append($text).append($icon));
				$contents.appendTo($text);
				$this.attr('title', config.title);
				// Done
				return $this;
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.help = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});	
	}
	else {
		window.console.warn("$.Help has already been defined...");
	}


})(jQuery);/**
 * @depends jquery, core.console, jquery.balclass
 * @name jquery.balclass.timepicker
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery Time Picker
	 * @version 1.3.1
	 * @date August 20, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	if ( !($.Timepicker||false) ) {
		/**
		 * $.timepicker
		 */
		$.Timepicker = $.BalClass.create({
			// Configuration
			config: {
				'default': {
					useHtml5: false,
					timeConvention: 12
				},
				'12hr': {
					timeConvention: 12
				},
				'24hr': {
					timeConvention: 24
				}
			},
			// Functions
			fn: function(mode,options){
				// Prepare
				var Me = $.Timepicker;
				var config = Me.getConfigWithDefault(mode,options);
				// Handle
				return $(this).each(function(){
					var $input = $(this);
	
					// Prepare
					if ( $input.hasClass('sparkle-time-has') ) {
						// Already done
						return this;
					}
					$input.addClass('sparkle-time').addClass('sparkle-time-has');
					
					// HTML5
					if ( config.useHtml5 && Modernizr && Modernizr.inputtypes.date && $input.attemptTypeChangeTo('time') ) {
						// Chain
						return this;
					}
					
					// --------------------------
					
					// Defaults
					var value = $input.val(),
						date = new Date(),
						timeConvention = config.timeConvention,
						hours = 12,
						minutes = 0,
						meridian = 'am';
					
					// Assign
					if ( value ) {
						date.setTimestr(value);
						hours = date.getUTCHours();
						minutes = date.getUTCMinutes();
					}
					
					// Adjust
					if ( timeConvention === 12 && hours > 12 ) {
						meridian = 'pm';
						hours -= 12;
					}
					minutes = minutes.roundTo(5);
					
					// Check
					if ( timeConvention === 12 ) {
						if ( hours > 12 || hours < 1 ) {
							hours = 1;
							window.console.warn('timepicker.fn: Invalid Hours.', [this,arguments]);
						}
					}
					else {
						if ( hours > 23 || hours < 0 ) {
							hours = 1;
							window.console.warn('timepicker.fn: Invalid Hours.', [this,arguments]);
						}
					}
					if ( minutes > 60 || minutes < 0 ) {
						minutes = 0;
						window.console.warn('timepicker.fn: Invalid Minutes.', [this,arguments]);
					}
					
					// --------------------------
					// DOM Manipulation
					
					// Hide
					$input.hide();
					
					// Meridian
					if ( timeConvention === 12 ) {
						var $meridian = $('<select class="sparkle-time-meridian" />');
						$meridian.append('<option>am</option>');
						$meridian.append('<option>pm</option>');
						$meridian.val(meridian).insertAfter($input);
					}
					
					// Minutes
					var $minutes = $('<select class="sparkle-time-minutes" />');
					for ( var mins=55,min=0; min<=mins; min+=5) {
						$minutes.append('<option value="'+min+'">'+min.padLeft('0',2)+'</option>');
					}
					$minutes.val(minutes).insertAfter($input);
					
					// Hours
					var $hours = $('<select class="sparkle-time-hours" />');
					if ( timeConvention === 12 ) {
						for ( var hours=timeConvention,hour=1; hour<=hours; ++hour ) {
							$hours.append('<option value="'+hour+'">'+hour.padLeft('0',2)+'</option>');
						}
						$hours.val(hours-1).insertAfter($input);
					}
					else {
						for ( var hours=timeConvention,hour=0; hour<hours; ++hour ) {
							$hours.append('<option value="'+hour+'">'+hour.padLeft('0',2)+'</option>');
						}
						$hours.val(hours).insertAfter($input);
					}
					
					// --------------------------
					
					// Bind
					var updateFunction = function(){
						var hours = parseInt($hours.val(),10);
						var minutes = $minutes.val();
						if ( timeConvention === 12 ) {
							var meridian = $meridian.val();
							
							// PM Adjustment
							if ( hours !== 12 && meridian === 'pm' ) {
								hours += 12;
							}
							
							// AM Adjustment
							if ( hours === 12 && meridian === 'am' ) {
								hours = 0;
							}
						}
						
						// Apply
						var value = hours.padLeft(0,2)+':'+minutes.padLeft(0,2)+':00';
						$input.val(value).trigger('change');
					};
					$hours.add($minutes).add($meridian).change(updateFunction);
					$input.parent('form:first').submit(updateFunction);
	
					// Done
					return $input;
				});
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.timepicker = $.fn.Timepicker = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});
	}
	else {
		window.console.warn("$.Timepicker has already been defined...");
	}

	
})(jQuery);/**
 * @depends jquery, core.console, jquery.balclass, tinymce
 * @name jquery.balclass.tinymce
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery TinyMCE Extender
	 * @version 1.2.1
	 * @date August 20, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	if ( !($.Tinymce||false) ) {
		$.Tinymce = $.BalClass.create({
			// Configuration
			config: {
				'default': {
					// Location of TinyMCE script
					script_url: '/scripts/tiny_mce/tiny_mce.js',
		
					// General options
					theme: "advanced",
					plugins: "autoresize,safari,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template",

					// Theme options
					theme_advanced_buttons1: "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect,fontselect,fontsizeselect,|,code,",
					theme_advanced_buttons2: "cut,copy,paste,pastetext,pasteword,|,undo,redo,|,link,unlink,image,|,preview,|,forecolor,backcolor,|,bullist,numlist,|,outdent,indent,blockquote,|,fullscreen",
					theme_advanced_buttons3: "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup",
					theme_advanced_toolbar_location: "top",
					theme_advanced_toolbar_align: "left",
					theme_advanced_statusbar_location: "bottom",
					theme_advanced_path: false,
					theme_advanced_resizing: false,
					width: "100%",
		
					// Compat
					//add_form_submit_trigger: false,
					//submit_patch: false,
		
					// Example content CSS (should be your site CSS)
					// content_css : "css/content.css",
		
					// Replace values for the template plugin
					template_replace_values: {
			
					}
				},
				'rich': {
				},
				'simple': {
					theme_advanced_buttons2: "",
					theme_advanced_buttons3: ""
				}
			},
			// Functions
			fn: function(mode,options) {
				var Me = $.Tinymce;
				var config = Me.getConfigWithDefault(mode,options);
				var $this = $(this);
				// Apply + Return
				return $this.tinymce(config);
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.Tinymce = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});
	}
	else {
		window.console.warn("$.Tinymce has already been defined...");
	}

})(jQuery);/**
 * @depends jquery, core.console, jquery.extra, jquery.balclass
 * @name jquery.balclass.bespin.sparkle
 * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * Prepare Body
	 */
	$(document.body).addClass('js');

	/**
	 * jQuery Sparkle - jQuery's DRY Effect Library
	 * @version 1.5.0
	 * @date August 28, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://www.balupton/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
	 * @license GNU Affero General Public License version 3 {@link http://www.gnu.org/licenses/agpl-3.0.html}
	 */
	if ( !($.Sparkle||false) ) {
		/**
		 * $.SparkleClass
		 */
		$.SparkleClass = $.BalClass.clone({
			/**
			 * Alias for Sparkle.addExtension
			 */
			addExtensions: function() {
				// Prepare
				var Sparkle = this;
				
				// Handle
				var result = Sparkle.addExtension.apply(Sparkle,arguments);
				
				// Fire the Configured Promise
				Sparkle.onConfigured(true);
				
				// Return result
				return result;
			},
			
			/**
			 * Add an Extension
			 */
			addExtension: function() {
				// Prepare
				var Sparkle = this,
					Extension = {};
				
				// Determine
				switch ( true ) {
					case Boolean(arguments[2]||false):
						// name, config, extension
						// name, extension, config
						if ( typeof arguments[0] === 'string' && typeof arguments[2] === 'function' && typeof arguments[1] === 'object' ) {
							Extension.extension = arguments[2];
							Extension.config = arguments[1];
							Extension.name = arguments[0];
						}
						if ( typeof arguments[0] === 'string' && typeof arguments[1] === 'function' && typeof arguments[2] === 'object' ) {
							Extension.extension = arguments[1];
							Extension.config = arguments[2];
							Extension.name = arguments[0];
						}
						else {
							window.console.error('Sparkle.addExtension: Invalid Input');
						}
						break;
						
					case Boolean(arguments[1]||false):
						// name, Extension
						// name, extension
						if ( typeof arguments[0] === 'string' && typeof arguments[1] === 'function' ) {
							Extension.extension = arguments[1];
							Extension.name = arguments[0];
						}
						else if ( typeof arguments[0] === 'string' && Sparkle.isExtension(arguments[1]) ){
							Extension = arguments[1];
							Extension.name = arguments[0];
						}
						else {
							window.console.error('Sparkle.addExtension: Invalid Input');
						}
						break;
						
					case Boolean(arguments[0]||false):
						// Extension
						// Series
						if ( Sparkle.isExtension(arguments[0]) ) {
							Extension = arguments[0];
						}
						else if ( typeof arguments[0] === 'object' || typeof arguments[0] === 'array' ) {
							// Series
							$.each(arguments[0],function(key,value){
								Sparkle.addExtension(key,value);
							});
							// Chain
							return this;
						}
						else {
							window.console.error('Sparkle.addExtension: Invalid Input');
						}
						break;
				}
				
				// Ensure
				Extension.config = Extension.config||{};
				Extension.extension = Extension.extension||{};
				
				// Add Extension
				Sparkle.addConfig(Extension.name, Extension);
				
				// Bind Ready Handler
				Sparkle.onReady(function(){
					// Fire Extension
					Sparkle.triggerExtension($('body'),Extension);
				});
				
				// Chain
				return this;
			},
			
			/**
			 * Do we have that Extension
			 */
			hasExtension: function (extension) {
				// Prepare
				var	Sparkle = this,
					Extension = Sparkle.getExtension(extension);
				
				// Return
				return Extension !== 'undefined';
			},
			
			/**
			 * Is the passed Extension an Extension
			 */
			isExtension: function (extension) {
				// Return
				return Boolean(extension && (extension.extension||false));
			},
			
			/**
			 * Get the Extensions
			 */
			getExtensions: function ( ) {
				// Prepare
				var	Sparkle = this,
					Config = Sparkle.getConfig(),
					Extensions = {};
				
				// Handle
				$.each(Config,function(key,value){
					if ( Sparkle.isExtension(value) ) {
						Extensions[key] = value;
					}
				});
				
				// Return Extensions
				return Extensions;
			},
			
			/**
			 * Get an Extension
			 */
			getExtension: function(extension) {
				// Prepare
				var	Sparkle = this,
					Extension = undefined;
				
				// HAndle
				if ( Sparkle.isExtension(extension) ) {
					Extension = extension;
				}
				else {
					var fetched = Sparkle.getConfigWithDefault(extension);
					if ( Sparkle.isExtension(fetched) ) {
						Extension = fetched;
					}
				}
				
				// Return Extension
				return Extension;
			},
			
			/**
			 * Get Config from an Extension
			 */
			getExtensionConfig: function(extension) {
				// Prepare
				var	Sparkle = this
					Extension = Sparkle.getExtension(extension);
				
				// Return
				return Extension.config||{};
			},
			
			/**
			 * Apply Config to an Extension
			 */
			applyExtensionConfig: function(extension, config) {
				// Prepare
				var Sparkle = this;
				
				// Handle
				Sparkle.applyConfig(extension, {'config':config});
				
				// Chain
				return this;
			},
			
			/**
			 * Trigger all the Extensions
			 */
			triggerExtensions: function(element){
				// Prepare
				var	Sparkle = this,
					Extensions = Sparkle.getExtensions();
					
				// Handle
				$.each(Extensions,function(extension,Extension){
					Sparkle.triggerExtension(element,Extension);
				});
				
				// Chain
				return this;
			},
			
			/**
			 * Trigger Extension
			 */
			triggerExtension: function(element,extension){
				// Prepare
				var	Sparkle = this,
					Extension = Sparkle.getExtension(extension),
					element = element instanceof jQuery ? element : $('body');
					
				// Handle
				if ( Extension ) {
					return Extension.extension.apply(element, [Sparkle, Extension.config, Extension]);
				}
				else {
					window.console.error('Sparkle.triggerExtension: Could not find the extension.', [this,arguments], [extension,Extension]);
				}
				
				// Chain
				return this;
			},
			
			/**
			 * Sparkle jQuery Function
			 */
			fn: function(Sparkle,extension){
				// Prepare
				var $el = $(this); 
				
				// HAndle
				if ( extension ) {
					// Individual
					Sparkle.triggerExtension.apply(Sparkle, [$el,extension]);
				} else {
					// Series
					Sparkle.triggerExtensions.apply(Sparkle, [$el]);
				}
				
				// Chain
				return this;
			},
			
			/**
			 * Sparkle Constructor
			 */
			built: function(){
				// Prepare
				var Sparkle = this;
				
				// --------------------------
				
				// Attach
				$.fn.sparkle = function(extension) {
					// Alias
					return Sparkle.fn.apply(this,[Sparkle,extension]);
				};
				
				// --------------------------
				// Setup Promises
				
				// Bind DomReady Handler
				$(function(){
					// Fire DocumentReady Promise
					Sparkle.onDocumentReady(true);
				});
				
				// Bind Configured Handler
				Sparkle.onConfigured(function(){
					// Bind DocumentReady Handler
					Sparkle.onDocumentReady(function(){
						// Fire Ready Promise
						Sparkle.onReady(true);
					});
				});
				
				// --------------------------
				
				// Return true
				return true;
			},
			
			/**
			 * Handle the Configured Promise
			 * We use promise as the function will fire if the event was already fired as it is still true
			 * @param {mixed} arguments
			 */
			onConfigured: function(){
				var Sparkle = this;
				
				// Handle Promise
				return $.promise({
					'object': Sparkle,
					'handlers': 'onConfiguredHandlers',
					'flag': 'isConfigured',
					'arguments': arguments
				});
			},
			
			/**
			 * Handle the DocumentReady Promise
			 * We use promise as the function will fire if the event was already fired as it is still true
			 * @param {mixed} arguments
			 */
			onDocumentReady: function(handler){
				// Prepare
				var Sparkle = this;
				
				// Handle Promise
				return $.promise({
					'object': Sparkle,
					'handlers': 'onDocumentReadyHandlers',
					'flag': 'isDocumentReady',
					'arguments': arguments
				});
			},
			
			/**
			 * Handle the Ready Promise
			 * We use promise as the function will fire if the event was already fired as it is still true
			 * @param {mixed} arguments
			 */
			onReady: function(handler){
				// Prepare
				var Sparkle = this;
				
				// Handle Promise
				return $.promise({
					'object': Sparkle,
					'handlers': 'onReadyHandlers',
					'flag': 'isReady',
					'arguments': arguments
				});
			}
			
		});
		
		/**
		 * $.Sparkle
		 */
		$.Sparkle = $.SparkleClass.create().addExtensions({
			'date': {
				config: {
					selector: '.sparkle-date',
					datepickerOptions: {
					},
					demoText: 'Date format must use the international standard: [year-month-day]. This due to other formats being ambigious eg. day/month/year or month/day/year.',
					demo: '<input type="text" class="sparkle-date" value="2010-08-05" />'
				},
				extension: function(Sparkle, config){
					var $this = $(this);
					
					// Fetch
					var $elements = $this.findAndSelf(config.selector);
					if ( !$elements.length ) {
						return true;
					}
					
					// Check
					if ( typeof $elements.Datepicker === 'undefined' ) {
						window.console.warn('Datepicker not loaded. Did you forget to include it?');
						return false;
					}
					
					// Apply
					$elements.Datepicker(config.datepickerOptions);
					
					// Done
					return true;
				}
			},
			'time': {
				config: {
					selector: '.sparkle-time',
					timepickerOptions: {
					},
					demoText: 'Time format must be either [hour:minute:second] or [hour:minute], with hours being between 0-23.',
					demo: '<input type="text" class="sparkle-time" value="23:11" />'
				},
				extension: function(Sparkle, config){
					var $this = $(this);
					
					// Fetch
					var $elements = $this.findAndSelf(config.selector);
					if ( !$elements.length ) {
						return true;
					}
					
					// Check
					if ( typeof $elements.Timepicker === 'undefined' ) {
						window.console.warn('Timepicker not loaded. Did you forget to include it?');
						return false;
					}
					
					// Apply
					$elements.Timepicker(config.timepickerOptions);
					
					// Done
					return true;
				}
			},
			'datetime': {
				config: {
					selector: '.sparkle-datetime',
					datepickerOptions: {
					},
					timepickerOptions: {
					},
					demoText: 'Date format must use the international standard: [year-month-day]. This due to other formats being ambigious eg. day/month/year or month/day/year.<br/>\
						Time format must be either [hour:minute:second] or [hour:minute], with hours being between 0-23.',
					demo: '<input type="text" class="sparkle-datetime" value="2010-08-05 23:10:09" />'
				},
				extension: function(Sparkle, config){
					var $this = $(this);
					
					// Fetch
					var $elements = $this.findAndSelf(config.selector);
					if ( !$elements.length ) {
						return true;
					}
					
					// Check
					if ( typeof $elements.Datetimepicker === 'undefined' ) {
						window.console.warn('Datetimepicker not loaded. Did you forget to include it?');
						return false;
					}
					
					// Apply
					$elements.Datetimepicker({
						datepickerOptions: Sparkle.getExtensionConfig('date').datepickerOptions,
						timepickerOptions: Sparkle.getExtensionConfig('time').timepickerOptions
					});
					
					// Done
					return true;
				}
			},
			'hide-if-empty': {
				config: {
					selector: '.sparkle-hide-if-empty:empty',
					demo: '<div class="sparkle-hide-if-empty" style="border:1px solid black"></div>'+"\n"+
						  '<div class="sparkle-hide-if-empty" style="border:1px solid black">Hello World</div>'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					
					// Fetch
					var $elements = $this.findAndSelf(config.selector);
					if ( !$elements.length ) {
						return true;
					}
					
					// Apply
					$elements.hide();
					
					// Done
					return true;
				}
			},
			'hide': {
				config: {
					selector: '.sparkle-hide',
					demo: '<div class="sparkle-hide">Something to Hide when Sparkle has Loaded</div>'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					
					// Fetch
					var $elements = $this.findAndSelf(config.selector);
					if ( !$elements.length ) {
						return true;
					}
					
					// Apply
					$elements.removeClass(config.selector.replace('.','')).hide();
					
					// Done
					return true;
				}
			},
			'show': {
				config: {
					selector: '.sparkle-show',
					demo: '<div class="sparkle-show" style="display:none;">Something to Show when Sparkle has Loaded</div>'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					
					// Fetch
					var $elements = $this.findAndSelf(config.selector);
					if ( !$elements.length ) {
						return true;
					}
					
					// Apply
					$elements.removeClass(config.selector.replace('.','')).show();
					
					// Done
					return true;
				}
			},
			'subtle': {
				config: {
					selector: '.sparkle-subtle',
					css: {
					},
					inSpeed: 200,
					inCss: {
						'opacity': 1
					},
					outSpeed: 400,
					outCss: {
						'opacity': 0.5
					},
					demo: '<div class="sparkle-subtle">This is some subtle text. (mouseover)</div>'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					
					// Fetch
					var $elements = $this.findAndSelf(config.selector);
					if ( !$elements.length ) {
						return true;
					}
					
					// Apply
					var css = {};
					$.extend(css, config.outCss, config.css);
					$elements.css(css).opacityFix().hover(function() {
						// Over
						$(this).stop(true, false).animate(config.inCss, config.inSpeed);
					}, function() {
						// Out
						$(this).stop(true, false).animate(config.outCss, config.outSpeed);
					});
					
					// Done
					return true;
				}
			},
			'panelshower': {
				config: {
					selectorSwitch: '.sparkle-panelshower-switch',
					selectorPanel: '.sparkle-panelshower-panel',
					inSpeed: 200,
					outSpeed: 200,
					demo: ''
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					
					// Fetch
					var $switches = $this.findAndSelf(config.selectorSwitch);
					var $panels = $this.findAndSelf(config.selectorPanel);
					if ( !$switches.length && !$panels.length ) {
						return true;
					}
					
					// Events
					var events = {
						clickEvent: function(event) {
							var $switch = $(this);
							var $panel = $switch.siblings(config.selectorPanel).filter(':first');
							var value = $switch.val();
							var show = $switch.is(':checked,:selected') && !(!value || value === 0 || value === '0' || value === 'false' || value === false || value === 'no' || value === 'off');
							if (show) {
								$panel.fadeIn(config.inSpeed);
							}
							else {
								$panel.fadeOut(config.outSpeed);
							}
						}
					};
					
					// Apply
					$switches.once('click',events.clickEvent);
					$panels.hide();
					
					// Done
					return true;
				}
			},
			'autogrow': {
				config: {
					selector: 'textarea.autogrow,textarea.autosize',
					demo: '<textarea class="autogrow">This textarea will autogrow with your input. - Only if jQuery Autogrow has been loaded.</textarea>'
				},
				extension: function(Sparkle, config){
					var $this = $(this);
					
					// Fetch
					var $elements = $this.findAndSelf(config.selector);
					if ( !$elements.length ) {
						return true;
					}
					
					// Check
					if (typeof $.fn.autogrow === 'undefined') {
						window.console.warn('autogrow not loaded. Did you forget to include it?');
						return false;
					}
					
					// Apply
					$elements.autogrow();
					
					// Done
					return true;
				}
			},
			'gsfnwidget': {
				config: {
					selector: '.gsfnwidget',
					demo: '<a class="gsfnwidget" href="#">This link will show a GetSatisfaction Widget onclick. - Only if GetSatisfaction has been loaded.</a>'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					
					// Events
					var events = {
						clickEvent: function(event) {
							if ( typeof GSFN_feedback_widget === 'undefined' ) {
								window.console.warn('GSFN not loaded. Did you forget to include it?');
								return true; // continue with click event
							}
							GSFN_feedback_widget.show();
							//event.stopPropagation();
							event.preventDefault();
							return false;
						}
					};
					
					// Fetch
					var $elements = $this.findAndSelf(config.selector);
					if ( !$elements.length ) {
						return true;
					}
					
					// Apply
					$elements.once('click',events.clickEvent);
					
					// Done
					return true;
				}
			},
			'hint': {
				config: {
					selector: '.form-input-tip,.sparkle-hint,.sparkle-hint-has,:text[placeholder]',
					hasClass: 'sparkle-hint-has',
					hintedClass: 'sparkle-hint-hinted',
					demoText: 'Simulates HTML5\'s <code>placeholder</code> attribute for non HTML5 browsers. Placeholder can be the <code>title</code> or <code>placeholder</code> attribute. Placeholder will not be sent with the form (unlike most other solutions). The <code>sparkle-hint</code> class is optional if you are using the <code>placeholder</code> attribute.',
					demo: '<input type="text" class="sparkle-hint" placeholder="This is some hint text." title="This is a title." /><br/>'+"\n"+
						  '<input type="text" class="sparkle-hint" title="This is some hint text." />'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					
					// Fetch
					var $inputs = $this.findAndSelf(config.selector).addClass(config.hasClass);
					if ( !$inputs.length ) {
						return true;
					}
					
					// Events
					var events = {
						focusEvent: function(){
							var $input = $(this);
							var tip = $input.attr('placeholder')||$input.attr('title');
							var val = $input.val();
							// Handle
							if (tip === val) {
								$input.val('').removeClass(config.hintedClass);
							}
							// Done
							return true;
						},
						blurEvent: function(){
							var $input = $(this);
							var tip = $input.attr('placeholder')||$input.attr('title');
							var val = $input.val();
							// Handle
							if (tip === val || !val) {
								$input.val('').addClass(config.hintedClass).val(tip);
							}
							// Done
							return true;
						},
						submitEvent: function(){
							$inputs.trigger('focus');
						}
					};
					
					// Apply
					if ( typeof Modernizr !== 'undefined' && Modernizr.input.placeholder ) {
						// We Support HTML5 Hinting
						$inputs.each(function(){
							var $input = $(this);
							// Set the placeholder as the title if the placeholder does not exist
							// We could use a filter selector, however we believe this should be faster - not benchmarked though
							var title = $input.attr('title');
							if ( title && !$input.attr('placeholder') ) {
								$input.attr('placeholder',title);
							}
						});
					}
					else {
						// We Support Javascript Hinting
						$inputs.each(function(){
							var $input = $(this);
							$input.once('focus',events.focusEvent).once('blur',events.blurEvent).trigger('blur');
						});
						$this.find('form').once('submit',events.submitEvent);
					}
					
					// Done
					return $this;
				}
			},
			'debug': {
				config: {
					selector: '.sparkle-debug',
					hasClass: 'sparkle-debug-has',
					hintedClass: 'sparkle-debug-hinted',
					showVar: 'sparkle-debug-show',
					demo: ''
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					
					// Fetch
					var $debug = $this.findAndSelf(config.selector);
					if ( !$debug.length ) {
						return true;
					}
					
					// Apply
					$debug.addClass(config.hasClass).find('.value:has(.var)').hide().siblings('.name,.type').addClass('link').once('singleclick',events.clickEvent).once('dblclick',events.dblclickEvent);
					
					// Events
					var events = {
						clickEvent: function(event){
							var $this = $(this);
							var $parent = $this.parent();
							var show = !$parent.data(config.showVar);
							$parent.data(config.showVar, show);
							$this.siblings('.value').toggle(show);
						},
						dblclickEvent: function(event){
							var $this = $(this);
							var $parent = $this.parent();
							var show = $parent.data(config.showVar); // first click will set this off
							$parent.data(config.showVar, show);
							$parent.find('.value').toggle(show);
						}
					};
					
					// Done
					return $this;
				}
			},
			'submit': {
				config: {
					selector: '.sparkle-submit',
					demoText: 'Adding the <code>sparkle-submit</code> class to an element within a <code>form</code> will submit the form when that element is clicked.'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);

					// Fetch
					var $submit = $this.findAndSelf(config.selector);
					if ( !$submit.length ) {
						return true;
					}
					
					// Events
					var events = {
						clickEvent: function(event){
							var $this = $(this).submitForm();
							return true;
						}
					};
					
					// Apply
					$submit.once('singleclick',events.clickEvent);
					
					// Done
					return $this;
				}
			},
			'submitswap': {
				config: {
					selector: '.sparkle-submitswap',
					demoText: 'Adding the <code>sparkle-submitswap</code> class to a submit button, will swap it\'s value with it\'s title when it has been clicked. Making it possible for a submit value which isn\'t the submit button\'s text.'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					
					// Fetch
					var $submit = $this.findAndSelf(config.selector);
					if ( !$submit.length ) {
						return true;
					}
					
					// Events
					var events = {
						clickEvent: function(event){
							// Fetch
							var $submit = $(this);
			
							// Put correct value back
							$submit.val($submit.data('sparkle-submitswap-value'));
			
							// Continue with Form Submission
							return true;
						}
					};
					
					// Apply
					$submit.once('singleclick',events.clickEvent);
					$submit.each(function(){
						var $submit = $(this);
						$submit.data('sparkle-submitswap-value', $submit.val());
						$submit.val($submit.attr('title'));
						$submit.removeAttr('title');
					});
	
					// Done
					return $this;
				}
			},
			'highlight-values': {
				config: {
					selector: '.sparkle-highlight-values',
					innerSelector: 'td,.column',
					empty: ['',false,null,'false','null',0,'-'],
					emptyClass: 'sparkle-highlight-values-empty',
					notemptyClass: 'sparkle-highlight-values-notempty',
					demoText: 'Adding the <code>sparkle-highlight-values</code> class to a table will highlight all <code>td</code> elements with non empty values. By adding <code>sparkle-highlight-values-notempty</code> or <code>sparkle-highlight-values-empty</code> to the corresponding <code>td</code> element - which can by styled by yourself. Benefit over css\'s <code>:empty</code> as 0, false, null and - are counted as empty values (not just "").'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					// Fetch
					var $container = $this.findAndSelf(config.selector);
					if ( !$container.length ) {
						return true;
					}
					// Apply
					var $inner = $container.findAndSelf(config.innerSelector);
					$inner.each(function(){
						var $this = $(this);
						var value = $this.text().trim();
						var empty = config.empty.has(value);
						if ( empty ) {
							$this.addClass(config.emptyClass);
						} else {
							$this.addClass(config.notemptyClass);
						}
					});
					// Done
					return $this;
				}
			},
			'demo': {
				config: {
					selector: '.sparkle-demo',
					hasClass: 'sparkle-debug-has',
					demoText: 'Adding the <code>sparkle-demo</code> will display all these demo examples used on this page.'
				},
				extension: function(Sparkle, config){
					var $this = $(this);
					var $container = $this.findAndSelf(config.selector);
					// Prepare
					if ( $container.hasClass(config.hasClass) || !$container.length ) {
						// Only run once
						return true;
					}
					$container.addClass(config.hasClass);
					// Fetch
					var Extensions = Sparkle.getExtensions();
					// Cycle
					$.each(Extensions,function(extension,Extension){
						var demo = Extension.config.demo||'';
						var demoText = Extension.config.demoText||'';
						if ( !demo && !demoText ) {
							return true; // continue
						}
						var $demo = $(
							'<div class="sparkle-demo-section" id="sparkle-demo-'+extension+'">\
								<h3>'+extension+'</h3>\
							</div>'
						);
						if ( demoText ) {
							$demo.append('<div class="sparkle-demo-text">'+demoText+'</div>');
						}
						if ( demo ) {
							var demoCode = demo.replace(/</g,'&lt;').replace(/>/g,'&gt;');
							$demo.append(
								'<h4>Example Code:</h4>\
								<pre class="code language-html sparkle-demo-code">'+demoCode+'</pre>\
								<h4>Example Result:</h4>\
								<div class="sparkle-demo-result">'+demo+'</div>'
							);
						}
						$demo.appendTo($container);
					});
					// Sparkle
					$container.sparkle();
					// Done
					return $this;
				}
			}
		});
	}
	else {
		window.console.warn('$.Sparkle has already been defined...');
	}

})(jQuery);