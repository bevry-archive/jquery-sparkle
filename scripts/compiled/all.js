/**
 * @depends nothing
 */

/**
 * Remove a element, or a set of elements from an array
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright John Resig (MIT Licensed)
 */
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

/**
 * Get a element from an array at [index]
 * if [current] is set, then set this index as the current index (we don't care if it doesn't exist)
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.get = function(index, current) {
	if ( index === 'first' ) index = 0;
	else if ( index === 'last' ) index = this.length-1;
	else if ( !index && index !== 0 ) index = this.index;
	var result = this[index] || undefined;
	if ( current !== false ) this.setIndex(index);
	return result;
};

/**
 * Apply the function [fn] to each element in the array
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.each = function(fn){
	for (var i = 0; i < this.length; ++i) {
		if (fn(i, this[i], this) === false) 
			break;
	}
	return this;
}

/**
 * Set the current index of the array
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.setIndex = function(index){
	if ( index < this.length && index >= 0 ) {
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.current = function(index){
	return this.get(index, true);
};

/**
 * Get whether or not the array is empty
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.isEmpty = function(){
	return this.length === 0;
};

/**
 * Get whether or not the array has only one item
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.isSingle = function(){
	return this.length === 1;
};

/**
 * Get whether or not the array is not empty
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.isNotEmpty = function(){
	return this.length !== 0;
};

/**
 * Get whether or not the array has more than one item
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.isNotEmpty = function(){
	return this.length > 1;
};

/**
 * Get whether or not the current index is the last one
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.isLast = function(index){
	index = typeof index === 'undefined' ? this.index : index;
	return !this.isEmpty() && index === this.length-1;
}

/**
 * Get whether or not the current index is the first one
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.isFirst = function(index){
	index = typeof index === 'undefined' ? this.index : index;
	return !this.isEmpty() && index === 0;
}

/**
 * Clear the array
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.clear = function(){
	this.length = 0;
};

/**
 * Set the index as the next one, and get the item
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.next = function(update){
	return this.get(this.index+1, update);
};

/**
 * Set the index as the previous one, and get the item
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.prev = function(update){
	return this.get(this.index-1, update);
};

/**
 * Reset the index
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.reset = function(){
	this.index = null;
	return this;
};

/**
 * Set the [index] to the [item]
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.add = function(){
	this.push.apply(this,arguments);
	return this;
};

/**
 * Insert the [item] at the [index] or at the end of the array
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * Get whether or not hte value exists in the array
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Array.prototype.has = Array.prototype.has || function(value){
	// Is the value in the array?
	var has = false;
	for ( var i=0, n=this.length; i<n; ++i ) {
		if ( value == this[i] ) {
			has = true;
			break;
		}
	}
	return has;
};/**
 * @depends nothing
 */

/**
 * Return a new string with any spaces trimmed the left and right of the string
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
String.prototype.trim = String.prototype.trim || function() {
	// Trim off any whitespace from the front and back
	return this.replace(/^\s+|\s+$/g, '');
};

/**
 * Return a new string with the value stripped from the left and right of the string
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
String.prototype.strip = String.prototype.strip || function(value){
	// Strip a value from left and right
	value = String(value);
	var str = this.replace(eval('/^'+value+'+|'+value+'+$/g'), '');
	return String(str);
}

/**
 * Return a new string with the value stripped from the left of the string
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
String.prototype.stripLeft = String.prototype.stripLeft || function(value){
	// Strip a value from the left
	value = String(value);
	var str = this.replace(eval('/^'+value+'+/g'), '');
	return String(str);
}

/**
 * Return a new string with the value stripped from the right of the string
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
String.prototype.stripRight = String.prototype.stripRight || function(value){
	// Strip a value from the right
	value = String(value);
	var str = this.replace(eval('/'+value+'+$/g'), '');
	return String(str);
}

/**
 * Return a int of the string
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
String.prototype.toInt = String.prototype.toInt || function(){
	// Convert to a Integer
	return parseInt(this,10);
};

/**
 * Return a new string of the old string wrapped with the start and end values
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
String.prototype.wrap = String.prototype.wrap || function(start,end){
	// Wrap the string
	return start+this+end;
};

/**
 * Return a new string of a selection of the old string wrapped with the start and end values
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
String.prototype.wrapSelection = String.prototype.wrapSelection || function(start,end,a,z){
	// Wrap the selection
	if ( typeof a === 'undefined' || a === null ) a = this.length;
	if ( typeof z === 'undefined' || z === null ) z = this.length;
	return this.substring(0,a)+start+this.substring(a,z)+end+this.substring(z);
};

/**
 * Return a new string of the slug of the old string
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
String.prototype.toSlug = String.prototype.toSlug || function(){
	// Convert a string to a slug
	return this.toLowerCase().replace(/[\s_]/g, '-').replace(/[^-a-z0-9]/g, '').replace(/--+/g, '-');
}

/**
 * Return a new JSON object of the old string.
 * Turning 'a=b&c.e=d' to {a:'b',c:{e:'d'}}
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
	params = params.split(/\&|\&amp\;/);
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
		// console.log({'key':key,'value':value}, split);
		var keys = key.split('.');
		if ( keys.length === 1 )
		{	// Simple
			json[key] = value;
		}
		else
		{	// Advanced
			var path = '';
			for ( ii in keys )
			{	//
				key = keys[ii];
				path += '.'+key;
				eval('json'+path+' = json'+path+' || {}');
			}
			eval('json'+path+' = value');
		}
		// ^ We now have the parts added to your JSON object
	}
	return json;
};
/**
 * @depends nothing
 */

/**
 * Apply the Datetime string to the current Date object
 * Datetime string in the format of "year month day hour min sec". "hour min sec" all optional.
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
};/**
 * @depends nothing
 */

/**
 * Return a new string with zeroes added correctly to the front of the number, given the threshold
 * @version 1.0.0
 * @date June 30, 2010
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
 */
Number.prototype.roundTo = String.prototype.roundTo = String.prototype.roundTo || function(to){
	var val = String(parseInt(this,10));
	val = parseInt(val.replace(/[1,2]$/, 0).replace(/[3,4]$/, 5),10);
	return val;
};
/**
 * @depends jquery
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * Ajax Calendar
	 * @version 1.0.0
	 * @date June 30, 2010
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	$.fn.ajaxCalendar = function(options){
		// Group?
		var $calendar = $(this);
		if ( $calendar.length > 1 ) {
			$calendar.each(function(){
				$(this).ajaxCalendar(options);
			});
			return this;
		}
	
		// Prepare
		options = options||{};
		options.ajaxList = options.ajaxList||"entries";
		options.ajaxUrl = options.ajaxUrl||'/ajax-calendar';
		options.ajaxData = options.ajaxData||{};
		options.dayEntryClass = options.dayEntryClass||'has-entry';
		options.domEvents = options.domEvents||{};
		options.datepickerOptions = options.datepickerOptions||{};
		options.useCache = typeof options.useCache === 'undefined' ? true : options.useCache;
		options.disableClick = typeof options.disableClick === 'undefined' ? false : options.disableClick;
	
		// Calendar Entries Setup/Fetch
		var calendarEntries = {};//$calendar.data('calendarEntries')||{};
	
		// Our Checker
		var calendarEntriesExist = function(year,month) {
			return typeof calendarEntries[year+'-'+month] !== 'undefined';
		};
	
		// Our Getter
		var calendarEntriesGet = function(year,month) {
			return calendarEntries[year+'-'+month]||[];
		};
	
		// Our Setter
		var calendarEntriesSet = function(year,month,entries){
			calendarEntries[year+'-'+month] = entries||[];
			return true;
		};
	
		// Our Store
		var calendarEntriesStore = function(){
			//$calendar.data('calendarEntries',calendarEntries);
			return true;
		}
	
		// Our Extender Event
		var calendarEntriesRender = function(datepicker, year, month) {
			// Fetch the Entries
			var entries = calendarEntriesGet(year,month),
				$datepicker = $(datepicker);
		
			// Reset the Render
			var $days_tds = $datepicker.find('tbody td');
			var $days = $days_tds.find('a');
		
			// Disable Click
			if ( options.disableClick ) {
				$days_tds.unbind('click').removeAttr('onclick');
				$days.removeAttr('href').css('cursor','default');
			}
		
			// Cycle Through Entries
			$.each(entries, function(entryIndex,entry){
				var startMonth = entry.start.match(/-([0-9]+)-/)[1].stripLeft('0'),
				 	finishMonth = entry.finish.match(/-([0-9]+)-/)[1].stripLeft('0'),
					startDay = entry.start.match(/([0-9]+)\s/)[1].stripLeft('0'),
					finishDay = entry.finish.match(/([0-9]+)\s/)[1].stripLeft('0');
				var $startDay = startMonth == month ? $days.filter(':contains('+startDay+'):first') : $days.filter(':first'),
					$finishDay = finishMonth == month ? $days.filter(':contains('+finishDay+'):first') : $days.filter(':last');
			
				// Indexes
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
				$entryDays.addClass(options.dayEntryClass).each(function(dayIndex,dayElement){
					var $day = $(dayElement);
					var day = $day.text().trim();
					var dayEntriesIds = $day.data('dayEntriesIds');
				
					// Handle
					if ( typeof dayEntriesIds === 'undefined' ) {
						dayEntriesIds = entryIndex;
					} else {
						dayEntriesIds = String(dayEntriesIds).split(/,/g);
						dayEntriesIds.push(entryIndex);
						dayEntriesIds = dayEntriesIds.join(',');
					}
				
					// Apply
					$day.data('dayEntriesIds',dayEntriesIds);
				
					// Bind Entries
					$.each(options.domEvents,function(domEventName,domEventHandler){
						$day.unbind(domEventName).bind(domEventName,function(domEvent){
							// Prepare
							var $day = $(this);
							var day = $day.text().trim();
							var dayEntriesIds = String($day.data('dayEntriesIds')).split(/,/g);

							// Entries
							var dayEntries = []
							$.each(dayEntriesIds,function(i,entryIndex){
								var dayEntry = entries[entryIndex];
								dayEntries.push(dayEntry);
							});
						
							// Fire
							domEventHandler.apply(this, [domEvent, day, dayEntries, entries]);
						
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
			var url = options.ajaxUrl,
				data = $.extend({},{
						year: year,
						month: month
					},
					options.ajaxData
				);
			var datepicker = inst.dpDiv;
		
			// Check
			if ( options.useCache && calendarEntriesExist(year,month) ) {
				// Use the cache
				setTimeout(function(){
					calendarEntriesRender(datepicker, year,month)
				},50);
			}
			else {
				// Fetch into the cache
				$.ajax({
					url:  url,
					method: 'post',
					dataType: 'json',
					data: data,
					success: function(data, status){
						// Cycle
						var entries = data[options.ajaxList]||[];
				
						// Store the Entries in the Calendar Data
						calendarEntriesSet(year,month,entries);
						calendarEntriesStore();
				
						// Apply the Entries
						calendarEntriesRender(datepicker, year,month);
					}
				});
			}
		
			// Done Change
			return true;
		}
	
		// Calendar Options
		var datepickerOptions = $.extend({}, options.datepickerOptions, {
			onChangeMonthYear: function(year, month, inst) {
				return calendarChangeMonthYear(year,month,inst);
			},
			beforeShow: function(input, inst) {
				setTimeout(function(){
					return calendarChangeMonthYear(inst.drawYear,inst.drawMonth+1,inst);
				},1000);
			}
		});
	
		// Apply Options so we can hook into the events
		$calendar.datepicker(datepickerOptions);
	
		// Chain
		return $calendar;
	};



})(jQuery);/**
 * @depends jquery
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * Append a Stylesheet to the DOM
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.appendStylesheet = $.appendStylesheet || function(url, overwrite){
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
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.appendScript = $.appendScript || function(url, overwrite){
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
	

})(jQuery);/**
 * @depends jquery
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * Get all elements above ourself which match the selector, and include ourself in the search
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.parentsAndSelf = $.fn.parentsAndSelf || function(selector){
		var $this = $(this);
		return $this.parents(selector).andSelf().filter(selector);
	};
	
	/**
	 * Get all elements within ourself which match the selector, and include ourself in the search
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.findAndSelf = $.fn.findAndSelf || function(selector){
		var $this = $(this);
		return $this.find(selector).andSelf().filter(selector);
	};
	
	/**
	 * Find the first input, and include ourself in the search
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.inDOM = function(){
		var $ancestor = $(this).parent().parent();
		return $ancestor.size() && ($ancestor.height()||$ancestor.width());
	};
	
	/**
	 * Wrap the element's value with the passed start and end text
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.valWrap = function(start,end){
		// Wrap a value
		var $field = $(this);
		return $field.val($field.val().wrap(start,end));
	};
	
	/**
	 * Wrap a selection of the element's value with the passed start and end text
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.valWrapSelection = function(start,end,a,z){
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
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.giveFocus = function(){
		// Give focus to the current element
		var $this = $(this);
		var selector = ':input:visible:first';
		$this.findAndSelf(selector).focus();
		return this;
	};
	
	/**
	 * Perform the highlight effect
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.highlight = function(duration){
		// Perform the Highlight Effect
		return $(this).effect('highlight', {}, duration||3000);
	};
	

})(jQuery);/**
 * @depends jquery
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
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.enter = $.fn.enter || function(data,callback){
		return $(this).binder('enter',data,callback);
	};
	$.event.special.enter = $.event.special.cancel || {
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
			if ( event.keyCode !== 13 ) { // Enter
				return;
			}
			// Fire
			event.type = 'cancel';
			$.event.handle.apply(this, arguments);
			return true;
		}
	};
	
	/**
	 * Event for pressing the escape key
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.cancel = $.fn.cancel || function(data,callback){
		return $(this).binder('cancel',data,callback);
	};
	$.event.special.cancel = $.event.special.cancel || {
		setup: function( data, namespaces ) {
			$(this).bind('keypress', $.event.special.cancel.handler);
		},
		teardown: function( namespaces ) {
			$(this).unbind('keypress', $.event.special.cancel.handler);
		},
		handler: function( event ) {
			// Prepare
			var $el = $(this);
			// Setup
			if ( event.keyCode !== 27 ) { // ESC
				return;
			}
			// Fire
			event.type = 'cancel';
			$.event.handle.apply(this, arguments);
			return true;
		}
	};
	
	/**
	 * Event for performing a singleclick
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
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
			// Prepare
			var $el = $(this);
			// Setup
			$el.data('clicking', $el.data('clicking')||'no');
			if ( $el.data('clicking') === 'yes' ) {
				return;
			} else {
				$el.data('clicking', 'yes');
				setTimeout(function(){
					$el.data('clicking', 'no');
				},	500);
			}
			// Fire
			event.type = 'singleclick';
			$.event.handle.apply(this, arguments);
			return true;
		}
	};
	

})(jQuery);/**
 * @depends jquery
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * String.prototype.passwordStrength
	 * @version 1.0.0
	 * @date June 30, 2010
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	String.prototype.passwordStrength = String.prototype.passwordStrength || function(confirm,username){
		/**
		 * Checks the string as a password to identify it's strength
		 * @copyright (c) Wordpress
			 * @copyright (c) 2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
			 * @license GNU General Public License - {@link http://wordpress.org/about/gpl/}
			 */
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
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	$.fn.passwordStrength = $.fn.passwordStrength || function(options) {
		// Prepare
		var passwordStrength = $.fn.passwordStrength;
		passwordStrength.config = passwordStrength.config || {
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
		var config = $.extend({}, passwordStrength.config);
	
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
			var strength = password ? password.passwordStrength(confirm,username) : "empty";
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
	

})(jQuery);/**
 * @depends jquery
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * BalClass
	 * @version 1.0.0
	 * @date June 30, 2010
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	if ( !($.BalClass||false) ) {
		$.BalClass = function(config){
			this.construct(config);
		};
		$.extend($.BalClass.prototype, {
			config: {
				'default': {}
			},
			construct: function(config){
				this.configure(config);
				return true;
			},
			configure: function(config){
				var Me = this;
				Me.config = Me.config||{};
				Me.config = $.extend({},Me.config,config||{}); // we want to clone
				return Me;
			},
			addConfig: function(name, config){
				var Me = this;
				if ( typeof config === 'undefined' ) {
					if ( typeof name === 'object' ) {
						// Series
						for ( var i in name ) {
							Me.applyConfig(i, name[i]);
						}
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
			}
		});
	}


})(jQuery);/**
 * @depends jquery, balclass.js
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery Time Picker
	 * @version 1.0.0
	 * @date June 30, 2010
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	$.timepicker = new $.BalClass({
		'default': {
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
	});
	$.fn.datetimepicker = $.fn.datetimepicker || function(){
		// Prepare
		var Me = $.timepicker;
		var config = Me.getConfigWithDefault(mode,options);
		// Handle
		return $(this).each(function(){
			var $input = $(this);
			$input.hide();
		
			// Prepare
			if ( $input.hasClass('sparkle-datetime-has') ) return $input; // already done
			$input.addClass('sparkle-datetime').addClass('sparkle-datetime-has');
	
			// Create date part
			var $date = $('<input type="text" class="sparkle-date"/>');
			var $sep = $('<span class="sparkle-datetime-sep"> @ </span>');
			var $time = $('<input type="text" class="sparkle-time"/>');
			//var $empty = $('<label class="form-empty">or <input type="checkbox" value="true"/> empty</label>');
	
			// Defaults
			var value = $input.val();
			var date = new Date();
			var datestr = '', timestr = '';
			if ( value ) {
				date.setDatetimestr(value);
				datestr = date.getDatestr();
				timestr = date.getTimestr();
			}
		
			// Append
			//$empty.insertAfter($input);
			$time.insertAfter($input);
			$sep.insertAfter($input);
			$date.insertAfter($input);
		
			// Apply
			$date.val(datestr);
			$time.val(timestr);
		
			// Bind
			var updateFunction = function(){
				var value = $date.val()+' '+$time.val();
				$input.val(value).trigger('change');
			};
			$date.add($time).change(updateFunction);
		
			// Instantiate
			$date.datepicker(config.datepickerOptions);
			$time.timepicker(config.timepickerOptions);
		
			// Chain
			return $input;
		});
	};

	
})(jQuery);/**
 * @depends jquery, console, balclass
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
	 * jQuery Sparkle
	 * @version 1.0.0
	 * @date June 30, 2010
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	if ( !($.SparkleClass||false) ) {
		/**
		 * Sparkle Class
		 */
		$.SparkleClass = function(config){
			this.construct(config);
		};
		$.extend($.SparkleClass.prototype, $.BalClass.prototype, {
			addExtension: function(name, func, config) {
				var Sparkle = $.Sparkle;
				if ( name === 'object' ) {
					// Series
					for ( var i in name ) {
						Sparkle.addExtension(i, name[i]);
					}
				} else {
					// Individual
					var Extension = {
						config: {},
						extension: false
					};
					// Discover
					if ( typeof func === 'object' && typeof func.config !== 'undefined' ) {
						Extension.config = func.config;
						Extension.extension = func.extension;
					} else {
						Extension.extension = func;
					}
					// Apply
					Sparkle.addConfig(name, Extension);
				}
				return true;
			},
			cycleExtensions: function(){
				var $this = $(this); var Sparkle = $.Sparkle;
				var Extensions = Sparkle.getExtensions();
				for ( var extension in Extensions ) {
					Sparkle.triggerExtension.apply($this, [extension]);
				}
				return $this;
			},
	
			getExtensions: function ( ) {
				var $this = $(this); var Sparkle = $.Sparkle;
				var Extensions = Sparkle.getConfig();
				return Extensions;
			},
			getExtension: function(extension) {
				var $this = $(this); var Sparkle = $.Sparkle;
				var Extension = Sparkle.getConfigWithDefault(extension);
				return Extension;
			},
			getExtensionConfig: function(extension) {
				var $this = $(this); var Sparkle = $.Sparkle;
				var Extension = Sparkle.getExtension(extension);
				return Extension.config||{};
			},
			configureExtension: function(extension, config) {
				var $this = $(this); var Sparkle = $.Sparkle;
				Sparkle.applyConfig(extension, {'config':config});
				return this; // chain
			},
	
			triggerExtension: function(extension){
				var $this = $(this); var Sparkle = $.Sparkle;
				var Extension = Sparkle.getExtension(extension);
				if ( typeof Extension.extension !== 'undefined' ) {
					// We are not just a config object but an actual extension
					return Extension.extension.apply($this, [Sparkle, Extension.config, Extension]);
				}
				return false;
			},
			fn: function(extension){
				var $this = $(this); var Sparkle = $.Sparkle;
				if ( extension ) {
					// Individual
					Sparkle.triggerExtension.apply($this, [extension]);
				} else {
					// Series
					Sparkle.cycleExtensions.apply($this, []);
				}
				return $this;
			},
			construct: function(config){
				var Sparkle = this;
				Sparkle.configure(config);
				$(function(){
					$.fn.sparkle = Sparkle.fn;
					$(document.body).sparkle();
				});
				return true;
			}
		});
		$.Sparkle = new $.SparkleClass({
			'date': {
				config: {
					selector: '.sparkle-date',
					datepickerOptions: {
					}
				},
				extension: function(Sparkle, config){
					var $this = $(this);
					var $item = $this.findAndSelf(config.selector);
					return typeof $item.datepicker === 'undefined' ? $item : $item.datepicker(config.datepickerOptions);
				}
			},
			'time': {
				config: {
					selector: '.sparkle-time',
					timepickerOptions: {
					}
				},
				extension: function(Sparkle, config){
					var $this = $(this);
					var $item = $this.findAndSelf(config.selector);
					return typeof $item.timepicker === 'undefined' ? $item : $item.timepicker(config.timepickerOptions);
				}
			},
			'datetime': {
				config: {
					selector: '.sparkle-datetime',
					datepickerOptions: {
					},
					timepickerOptions: {
					}
				},
				extension: function(Sparkle, config){
					var $this = $(this);
					var $item = $this.findAndSelf(config.selector);
					return typeof $item.datetimepicker === 'undefined' ? $item : $item.datetimepicker({
						datepickerOptions: Sparkle.getExtensionConfig('date').datepickerOptions,
						timepickerOptions: Sparkle.getExtensionConfig('time').timepickerOptions
					});
				}
			},
			'hide-if-empty': {
				config: {
					selector: '.sparkle-hide-if-empty:empty'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					return $this.findAndSelf(config.selector).hide();
				}
			},
			'hide': {
				config: {
					selector: '.sparkle-hide'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					return $this.findAndSelf(config.selector).removeClass(config.selector.replace('.','')).hide();
				}
			},
			'show': {
				config: {
					selector: '.sparkle-show'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					return $this.findAndSelf(config.selector).removeClass(config.selector.replace('.','')).show();
				}
			},
			'subtle': {
				config: {
					selector: '.sparkle-subtle',
					css: {
						'font-size': '80%'
					},
					inSpeed: 200,
					inCss: {
						'opacity': 1
					},
					outSpeed: 400,
					outCss: {
						'opacity': 0.5
					}
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					var $subtle = $this.findAndSelf(config.selector);
					return $subtle.css(config.css).hover(function() {
						// Over
						$(this).stop(true, false).animate(config.inCss, config.inSpeed);
					}, function() {
						// Out
						$(this).stop(true, false).animate(config.outCss, config.outSpeed);
					});
				}
			},
			'panelshower': {
				config: {
					selectorSwitch: '.sparkle-panelshower-switch',
					selectorPanel: '.sparkle-panelshower-panel',
					inSpeed: 200,
					outSpeed: 200
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					// Fetch
					var $switches = $this.findAndSelf(config.selectorSwitch);
					var $panels = $this.findAndSelf(config.selectorPanel);
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
					selector: 'textarea.autogrow,textarea.autosize'
				},
				extension: function(Sparkle, config){
					var $this = $(this);
					// Fetch
					var $els = $this.findAndSelf(config.selector);
					// Apply
					if ( $els.length ) {
						if (typeof $.fn.autogrow === 'undefined') {
							console.warn('Autogrow has failed to load.');
							return false;
						}
						$els.autogrow();
					}
					// Done
					return true;
				}
			},
			'gsfnwidget': {
				config: {
					selector: '.gsfnwidget'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					// Events
					var events = {
						clickEvent: function(event) {
							if ( typeof GSFN_feedback_widget === 'undefined' ) {
								console.warn('GSFN has failed to load.');
								return true;
							}
							GSFN_feedback_widget.show();
							//event.stopPropagation();
							event.preventDefault();
							return false;
						}
					};
					// Apply
					$(function() {
						$this.findAndSelf(config.selector).once('click',events.clickEvent);
					});
					// Done
					return true;
				}
			},
			'hint': {
				config: {
					selector: '.form-input-tip,.sparkle-hint,.sparkle-hint-has',
					hasClass: 'sparkle-hint-has',
					hintedClass: 'sparkle-hint-hinted'
				},
				extension: function(Sparkle, config) {
					var $this = $(this);
					// Fetch
					var $inputs = $this.findAndSelf(config.selector).addClass(config.hasClass);
					// Events
					var events = {
						focusEvent: function(){
							var $input = $(this);
							var tip = $input.attr('title');
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
							var tip = $input.attr('title');
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
					$inputs.each(function(){
						var $input = $(this);
						$input.once('focus',events.focusEvent).once('blur',events.blurEvent).trigger('blur');
					});
					$this.find('form').once('submit',events.submitEvent);
					// Done
					return $this;
				}
			},
			'debug': {
				config: {
					selector: '.sparkle-debug',
					hasClass: 'sparkle-debug-has',
					hintedClass: 'sparkle-debug-hinted',
					showVar: 'sparkle-debug-show'
				},
				extension: function(Sparkle, config) {
					var $this = $(this); var Sparkle = $.Sparkle;
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
					// Fetch
					var $debug = $this.findAndSelf(config.selector);
					$debug.addClass(config.hasClass).find('.value:has(.var)').hide().siblings('.name,.type').addClass('link').once('singleclick',events.clickEvent).once('dblclick',events.dblclickEvent);
					// Done
					return $this;
				}
			},
			'submit': {
				config: {
					selector: '.sparkle-submit'
				},
				extension: function(Sparkle, config) {
					var $this = $(this); var Sparkle = $.Sparkle;
					// Events
					var events = {
						clickEvent: function(event){
							var $this = $(this).submitForm();
							return true;
						}
					};
					// Fetch
					var $submit = $this.findAndSelf(config.selector);
					$submit.once('singleclick',events.clickEvent);
					// Done
					return $this;
				}
			},
			'submitswap': {
				config: {
					selector: '.sparkle-submitswap'
				},
				extension: function(Sparkle, config) {
					var $this = $(this); var Sparkle = $.Sparkle;
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
			
					// Fetch
					var $submit = $this.findAndSelf(config.selector);
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
					innerSelector: 'td',
					empty: ['',false,null,'false','null',0,'-'],
					emptyClass: 'sparkle-highlight-values-empty',
					notemptyClass: 'sparkle-highlight-values-notempty'
				},
				extension: function(Sparkle, config) {
					var $this = $(this); var Sparkle = $.Sparkle;
					// Fetch
					var $container = $this.findAndSelf(config.selector);
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
			}

		});

	}
	else {
		console.warn("Sparkle Class has already been defined...")
	}

})(jQuery);/**
 * @depends jquery, balclass.js
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery Bespin Extender
	 * @depends BalClass, bespin
 	 * @copyright (c) 2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	$.Bespin = new $.BalClass({
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
	});
	$.Bespin.fn = function(mode, options) {
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
		window.onBespinLoad = function(){
			$(window).trigger('onBespinLoad');
		};
	
		// Chain
		return this;
	};
	$.Bespin.useBespin = function(element, config) {
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
				throw new Error("Bespin Launch Failed: " + error);
			}
		);
	
		// Chain
		return this;
	};
	$.Bespin.postBespin = function(bespin_id, env, config) {
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
			$toolbar = $('<div class="bespin-toolbar" />');
			$toolbar.insertBefore($bespin);
		
			// Fullscreen
			if (config.toolbar.fullscreen||false ) {
				$fullscreen = $('<span class="bespin-toolbar-fullscreen">Fullscreen</span>');
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
	}
	$.fn.Bespin = function(mode,options) {
		// Alias
		return $.Bespin.fn.apply(this,[mode,options]);
	};


})(jQuery);/**
 * @depends jquery, balclass
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery Time Picker
	 * @version 1.0.0
	 * @date June 30, 2010
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	$.timepicker = new $.BalClass({
		'default': {
			timeConvention: 24
		},
		'12hr': {
			timeConvention: 12
		},
		'24hr': {
			timeConvention: 24
		}
	});
	$.fn.timepicker = $.fn.timepicker || function(mode,options){
		// Prepare
		var Me = $.timepicker;
		var config = Me.getConfigWithDefault(mode,options);
		// Handle
		return $(this).each(function(){
			var $input = $(this);
			$input.hide();
		
			// Prepare
			if ( $input.hasClass('sparkle-time-has') ) return $input; // already done
			$input.addClass('sparkle-time').addClass('sparkle-time-has');
		
			// Generate
			var $hours = $('<select class="sparkle-time-hours" />');
			for ( var hours=12,hour=1; hour<=hours; ++hour ) {
				$hours.append('<option value="'+hour+'">'+hour.padLeft('0',2)+'</option>');
			}
			var $minutes = $('<select class="sparkle-time-minutes" />');
			for ( var mins=55,min=0; min<=mins; min+=5) {
				$minutes.append('<option value="'+min+'">'+min.padLeft('0',2)+'</option>');
			}
			var $meridian = $('<select class="sparkle-time-meridian" />');
			$meridian.append('<option>am</option>');
			$meridian.append('<option>pm</option>');
		
			// Defaults
			var value = $input.val(),
				date = new Date(),
				hours = '12',
				minutes = '0',
				meridian = 'am';
			if ( value ) {
				date.setTimestr(value);
				hours = date.getUTCHours();
				minutes = date.getUTCMinutes();
				if ( hours > 12 ) {
					hours -= 12; meridian = 'pm';
				}
			}
		
			// Append
			$meridian.insertAfter($input);
			$minutes.insertAfter($input);
			$hours.insertAfter($input);
		
			// Apply
			if ( hours > 12 && meridian == 'pm' ) hours -= 12;
			$hours.val(hours);
			$minutes.val(minutes.roundTo(5));
			$meridian.val(meridian);
		
			// Bind
			var updateFunction = function(){
				var hours = parseInt($hours.val(),10);
				var minutes = $minutes.val();
				var meridian = $meridian.val();
				if ( meridian == 'pm' ) hours += 12;
				if ( hours >= 24 ) hours = 0;
				var value = hours.padLeft(0,2)+':'+minutes.padLeft(0,2)+':00';
				$input.val(value).trigger('change');
			};
			$hours.add($minutes).add($meridian).change(updateFunction);
			$input.parent('form:first').submit(updateFunction);
		
			// Done
			return $input;
		});
	};

	
})(jQuery);/**
 * @depends jquery, balclass
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery TinyMCE Extender
	 * @depends BalClass, $.fn.tinymce
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	$.Tinymce = new $.BalClass({
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
	});
	$.fn.Tinymce = function(mode,options) {
		var Me = $.Tinymce;
		var config = Me.getConfigWithDefault(mode,options);
		var $this = $(this);
		// Apply + Return
		return $this.tinymce(config);
	};

})(jQuery);/**
 * @depends jquery, balclass.js
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery Help
	 * @depends BalClass
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	$.Help = new $.BalClass({
		'default': {
			// Elements
			wrap: '<span class="sparkle-help-wrap"/>',
			icon: '<span class="sparkle-help-icon"/>',
			text: '<span class="sparkle-help-text"/>',
			parentClass: '',
			title: ''
		}
	});
	$.fn.help = function(options){
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
	}


})(jQuery);