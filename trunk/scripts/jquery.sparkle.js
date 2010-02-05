/**
 * jQuery Sparkle (balupton edition) - Simple Rich Effects
 * Copyright (C) 2009 Benjamin Arthur Lupton
 * http://www.balupton.com/projects/jquery-sparkle
 *
 * This file is part of jQuery Sparkle (balupton edition).
 * 
 * jQuery Sparkle (balupton edition) is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * jQuery Sparkle (balupton edition) is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with jQuery Lightbox (balupton edition).  If not, see <http://www.gnu.org/licenses/>.
 *
 * @name jquery_sparkle: jquery.sparkle.js
 * @package jQuery Sparkle (balupton edition)
 * @version 1.0.0-dev
 * @date August 11, 2009
 * @category jQuery plugin
 * @author Benjamin "balupton" Lupton {@link http://www.balupton.com}
 * @copyright (c) 2009 Benjamin Arthur Lupton {@link http://www.balupton.com}
 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
 * @example Visit {@link http://www.balupton.com/projects/jquery-sparkle} for more information.
 */

(function($){
	
	// Debug
	if (typeof console === 'undefined') {
		console = typeof window.console !== 'undefined' ? window.console : {};
	}
	console.log			= console.log 			|| function(){};
	console.debug		= console.debug 		|| console.log;
	console.warn		= console.warn			|| console.log;
	console.error		= console.error			|| function(){var args = [];for (var i = 0; i < arguments.length; i++) { args.push(arguments[i]); } alert(args.join("\n")); };
	console.trace		= console.trace			|| console.log;
	console.group		= console.group			|| console.log;
	console.groupEnd	= console.groupEnd		|| console.log;
	console.profile		= console.profile		|| console.log;
	console.profileEnd	= console.profileEnd	|| console.log;
	
	/**
	 * String.prototype.trim - Trim space off the front or back
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	String.prototype.trim = String.prototype.trim || function() {
		return this.replace(/^\s+|\s+$/g, '');
	};
	
	/**
	 * String.prototype.strip - Strip a value off the front and back
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	String.prototype.strip = String.prototype.strip || function(value){
		value = String(value);
		var str = this.replace(eval('/^'+value+'+|'+value+'+$/g'), '');
		return String(str);
	}
	
	/**
	 * String.prototype.stripLeft - Strip a value off the front
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	String.prototype.stripLeft = String.prototype.stripLeft || function(value){
		value = String(value);
		var str = this.replace(eval('/^'+value+'+/g'), '');
		return String(str);
	}
	
	/**
	 * String.prototype.stripRight - Strip a value off the front
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	String.prototype.stripRight = String.prototype.stripRight || function(value){
		value = String(value);
		var str = this.replace(eval('/'+value+'+$/g'), '');
		return String(str);
	}
	
	// Prototypes
	Number.prototype.padLeft = String.prototype.padLeft = String.prototype.padLeft ||function(ch, num){
		var val = String(this);
		var re = new RegExp(".{" + num + "}$");
		var pad = "";
		if ( !ch && ch !== 0 ) ch = " ";
		do  {
			pad += ch;
		} while(pad.length < num);
		return re.exec(pad + val)[0];
	};
	Number.prototype.padRight = String.prototype.padRight = String.prototype.padRight ||function(ch, num){
		var val = String(this);
		var re = new RegExp("^.{" + num + "}");
		var pad = "";
		if ( !ch && ch !== 0 ) ch = " ";
		do {
			pad += ch;
		} while (pad.length < num);
		return re.exec(val + pad)[0];
	};
	Date.prototype.setDatetimestr = Date.prototype.setDatetimestr || function(timestamp){
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
	Date.prototype.setDatestr = Date.prototype.setDatestr || function(timestamp){
		var pieces = timestamp.split(/[\-\s\:]/g);
		var year = pieces[0]||1978;
		var month = pieces[1]||0;
		var day = pieces[2]||1;
		this.setUTCFullYear(year,month-1,day);
		return this;
	};
	Date.prototype.setTimestr = Date.prototype.setTimestr || function(timestamp){
		var pieces = timestamp.split(/[\-\s\:]/g);
		var hour = pieces[0]||0;
		var min = pieces[1]||0;
		var sec = pieces[2]||0;
		this.setUTCHours(hour);
		this.setUTCMinutes(min);
		this.setUTCSeconds(sec);
		return this;
	};
	Date.prototype.getDatetimestr = Date.prototype.getDatetimestr || function() {
		var date = this;
		return date.getDatestr()+' '+date.getTimestr();
	}
	Date.prototype.getDatestr = Date.prototype.getDatestr || function() {
		var date = this;
		var year = date.getUTCFullYear();
		var month = (this.getUTCMonth() + 1).padLeft(0,2);
		var date = this.getUTCDate().padLeft(0,2);
		return year+'-'+month+'-'+date;
	}
	Date.prototype.getTimestr = Date.prototype.getTimestr || function(){
		var date = this;
		var hours = date.getUTCHours().padLeft(0,2);
		var minutes = date.getUTCMinutes().padLeft(0,2);
		var seconds = date.getUTCSeconds().padLeft(0,2);
		return hours+':'+minutes+':'+seconds;
	}
	
	// Prototypes
	$.fn.findAndSelf = $.fn.findAndSelf || function(selector){
		var $this = $(this);
		return $this.find(selector).andSelf().filter(selector);
	};
	$.fn.firstInput = $.fn.firstInput || function(selector){
		var $this = $(this);
		return $this.findAndSelf(':input').filter(':first');
	};
	$.fn.value = function(value){
		var $input = $(this).firstInput(), result;
		if ( value ) {
			$input.val(value);
			if ( $input.is('select') ) {
				$input.find('option[value=' + value + ']:first').attr('selected', 'selected');
			}
			result = $input;
		} else {
			var val = $input.val();
			if ( $input.is('select') ) {
				val = $input.find('option:selected').text();
			}
			result = val;
		}
		return result;
	};
	$.fn.once = $.fn.once || function(event, data, callback){
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
	$.fn.submitForm = $.fn.submitForm || function(){
		var $this = $(this);
		// Handle
		var $form = $this.parents('form:first').trigger('submit');
		// Chain
		return $this;
	};
	
	// jQuery Events
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
	
	// Timepicker
	$.fn.timepicker = $.fn.timepicker || function(options){
		return $(this).each(function(){
			var $input = $(this);
			$input.hide();
			// Prepare
			if ( $input.hasClass('jquery-time-has') ) return $input; // already done
			$input.addClass('jquery-time').addClass('jquery-time-has');
			// Generate
			var $hours = $('<select class="jquery-time-hours" />');
			for ( var hours=12,hour=1; hour<=hours; ++hour ) {
				$hours.append('<option value="'+hour+'">'+hour.padLeft('0',2)+'</option>');
			}
			var $minutes = $('<select class="jquery-time-minutes" />');
			for ( var mins=60,min=5; min<=mins; min+=5) {
				$minutes.append('<option value="'+min+'">'+min.padLeft('0',2)+'</option>');
			}
			var $meridian = $('<select class="jquery-time-meridian" />');
			$meridian.append('<option>am</option>');
			$meridian.append('<option>pm</option>');
			// Defaults
			var value = $input.val();
			var date = new Date(); date.setTimestr(value);
			var hours = date.getUTCHours();
			var minutes = date.getUTCMinutes();
			var meridian = 'am';
			if ( hours > 12 ) {
				hours -= 12; meridian = 'pm';
			}
			// Append
			$meridian.insertAfter($input);
			$minutes.insertAfter($input);
			$hours.insertAfter($input);
			// Apply
			if ( hours > 12 && meridian == 'pm' ) hours -= 12;
			$hours.value(hours);
			$minutes.value(minutes);
			$meridian.value(meridian);
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
	$.fn.datetimepicker = $.fn.datetimepicker || function(){
		return $(this).each(function(){
			var $input = $(this);
			$input.hide();
			// Prepare
			if ( $input.hasClass('jquery-datetime-has') ) return $input; // already done
			$input.addClass('jquery-datetime').addClass('jquery-datetime-has');
			// Create date part
			var $date = $('<input type="text" class="jquery-date"/>');
			var $sep = $('<span class="jquery-datetime-sep"> @ </span>');
			var $time = $('<input type="text" class="jquery-time"/>');
			// Defaults
			var value = $input.val();
			var date = new Date(); date.setDatetimestr(value);
			var datestr = date.getDatestr();
			var timestr = date.getTimestr();
			// Append
			$time.insertAfter($input);
			$sep.insertAfter($input);
			$date.insertAfter($input);
			// Apply
			$date.value(datestr);
			$time.value(timestr);
			// Bind
			var updateFunction = function(){
				var value = $date.val()+' '+$time.val();
				$input.val(value).trigger('change');
			};
			$date.add($time).change(updateFunction);
			// Sparkle
			$date.add($time).sparkle();
			// Done
			return $input;
		});
	};
	
	// ajaxCalendar
	$.fn.ajaxCalendar = function(options){
		// Prepare
		options = options||{};
		options.ajaxList = options.ajaxList||"entries";
		options.ajaxUrl = options.ajaxUrl||'/ajax-calendar';
		options.ajaxData = options.ajaxData||{};
		options.dayEntryClass = options.dayEntryClass||'has-entry';
		options.domEvents = options.domEvents||{};
		options.calendarOptions = options.calendarOptions||{};
		options.useCache = typeof options.useCache === 'undefined' ? true : options.useCache;
		var $calendar = $(this);
		
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
		var calendarEntriesRender = function(year,month) {
			// Fetch the Entries
			var entries = calendarEntriesGet(year,month);
			
			// Reset the Render
			var $days = $calendar.find('table > tbody > tr > td').unbind().find('a').removeAttr('href');
			
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
				
				/*
				console.log(
					'Entry: '+entry.id,
					[startDay,finishDay],
					[start,finish,duration],
					[$startDay.text().trim(),$finishDay.text().trim()],
					[$entryDays.filter(':first').text().trim(),$entryDays.filter(':last').text().trim(),$entryDays.length]
				);
				*/
				
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
		
		// Calendar Options
		var calendarOptions = $.extend({}, options.calendarOptions, {
			onChangeMonthYear: function(year, month, inst) {
				// Prepare
				var url = options.ajaxUrl,
					data = $.extend({},{
							year: year,
							month: month
						},
						options.ajaxData
					);
					
				// Check
				if ( options.useCache && calendarEntriesExist(year,month) ) {
					// Use the cache
					setTimeout(function(){
						calendarEntriesRender(year,month)
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
							calendarEntriesRender(year,month);
						}
					});
				}
				
				// Done Change
				return true;
			}
		});
		
		// Apply Options so we can hook into the events
		$calendar.datepicker(calendarOptions);
		
		// Chain
		return $calendar;
	};
	
	// Forms
	$.fn.choose = $.fn.choose||function(value){
		var $this = $(this);
		switch ( true ) {
			case $this.is('option'):
				$this.parents(':select:first').choose(value);
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
	}
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
	}
	
	// BalClass
	$.BalClass = $.BalClass || function(config){
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
			$.extend(Me.config[name],config||{});
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
			return $.extend({}, Me.config[name]||{}, config||{}); // clone
		},
		getConfigWithDefault: function(name,config){
			var Me = this;
			return Me.getConfigWith('default',Me.getConfigWith(name,config));
		}
	});
	
	// SparkleClass
	$.SparkleClass = function(config){
		this.construct(config);
	};
	$.extend($.SparkleClass.prototype, $.BalClass.prototype, {
		add: function(name, func, config) {
			var Sparkle = $.Sparkle;
			if ( name === 'object' ) {
				// Series
				for ( var i in name ) {
					Sparkle.add(i, name[i]);
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
		fn: function(extension){
			var $this = $(this); var Sparkle = $.Sparkle;
			if ( extension ) {
				// Individual
				Sparkle.trigger.apply($this, [extension]);
			} else {
				// Series
				Sparkle.cycle.apply($this, []);
			}
			return $this;
		},
		cycle: function(){
			var $this = $(this); var Sparkle = $.Sparkle;
			var Extensions = Sparkle.getConfig();
			for ( extension in Extensions ) {
				Sparkle.trigger.apply($this, [extension]);
			}
			return $this;
		},
		trigger: function(extension){
			var $this = $(this); var Sparkle = $.Sparkle;
			var Extension = Sparkle.getConfigWithDefault(extension);
			if ( typeof Extension.extension !== 'undefined' ) {
				// We are not just a config object but an actual extension
				return Extension.extension.apply($this, [Sparkle, Extension.config, Extension]);
			}
			return false;
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
	
	// Sparkle
	$.Sparkle = new $.SparkleClass({
		'date': {
			config: {
				selector: '.sparkle-date',
				dateformat: 'yy-mm-dd'
			},
			extension: function(Sparkle, config){
				var $this = $(this);
				var $item = $this.findAndSelf(config.selector);
				return typeof $item.datepicker === 'undefined' ? $item : $item.datepicker({
					dateFormat: config.dateformat
				});
			}
		},
		'time': {
			config: {
				selector: '.sparkle-time',
				timeconvention: 24
			},
			extension: function(Sparkle, config){
				var $this = $(this);
				var $item = $this.findAndSelf(config.selector);
				return typeof $item.timepicker === 'undefined' ? $item : $item.timepicker({
					convention: config.timeconvention
				});
			}
		},
		'datetime': {
			config: {
				selector: '.sparkle-datetime',
				dateformat: 'yy-mm-dd',
				timeconvention: 24
			},
			extension: function(Sparkle, config){
				var $this = $(this);
				var $item = $this.findAndSelf(config.selector);
				return typeof $item.datetimepicker === 'undefined' ? $item : $item.datetimepicker({
					dateFormat: config.dateformat,
					convention: config.timeconvention
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
				return $this.findAndSelf(config.selector).hide();
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
		'gsfn': {
			config: {
				selector: '.gsfn'
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
		}
	
	});
	
	
})(jQuery);