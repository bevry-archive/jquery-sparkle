/**
 * jQuery Sparkle (balupton edition) - Simple Rich Effects
 * Copyright (C) 2009 Benjamin Arthur Lupton
 * http://jquery.com/plugins/project/jquerylightbox_bal
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
 * @example Visit {@link http://jquery.com/plugins/project/jquerylightbox_bal} for more information.
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
	$.fn.value = function(value){
		var $input = $(this).firstInput();
		if ( value ) {
			$input.val(value);
			if ( $input.is('select') ) {
				$input.find('option[value=' + value + ']:first').attr('selected', 'selected');
			}
			return $input;
		} else {
			var val = $input.val();
			if ( $input.is('select') ) {
				val = $input.find('option:selected').text();
			}
			return val;
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
			Me.config = $.extend({},Me.config,config||{});
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
			return $.extend({}, Me.config[name]||{}, config||{});
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
				selector: '.jquery-date',
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
				selector: '.jquery-time',
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
				selector: '.jquery-datetime',
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
				selector: '.jquery-hide-if-empty:empty'
			},
			extension: function(Sparkle, config) {
				var $this = $(this);
				return $this.findAndSelf(config.selector).hide();
			}
		},
		'hide': {
			config: {
				selector: '.jquery-hide'
			},
			extension: function(Sparkle, config) {
				var $this = $(this);
				return $this.findAndSelf(config.selector).hide();
			}
		},
		'subtle': {
			config: {
				selector: '.jquery-subtle',
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
				var $suble = $this.findAndSelf(config.selector);
				return $suble.css(config.css).css(config.start).hover(function() {
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
				selectorSwitch: '.jquery-panelshower-switch',
				selectorPanel: '.jquery-panelshower-panel',
				inSpeed: 200,
				outSpeed: 200
			},
			extension: function(Sparkle, config) {
				var $this = $(this);
				var $switches = $this.findAndSelf(config.selectorSwitch);
				var $panels = $this.findAndSelf(config.selectorPanel);
				var panelswitch = function() {
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
				};
				$switches.click(panelswitch);
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
				var $els = $this.findAndSelf(config.selector);
				if ( $els.length ) {
					if (typeof $.fn.autogrow === 'undefined') {
						console.warn('Autogrow has failed to load.');
						return false;
					}
					$els.autogrow();
				}
				return true;
			}
		},
		'gsfn': {
			config: {
				selector: '.gsfn'
			},
			extension: function(Sparkle, config) {
				var $this = $(this);
				// Apply Action
				$(function() {
					// Apply
					$this.findAndSelf(config.selector).click(function(event) {
						if ( typeof GSFN_feedback_widget === 'undefined' ) {
							console.warn('GSFN has failed to load.');
							return true;
						}
						GSFN_feedback_widget.show();
						//event.stopPropagation();
						event.preventDefault();
						return false;
					});
				});
				// Done
				return $this;
			}
		},
		'hint': {
			config: {
				selector: '.form-input-tip,.sparkle-hint,.sparkle-hint-has',
				hasClass: 'sparkle-hint-has',
				hintedClass: 'sparkle-hint-hinted',
				
			},
			extension: function(Sparkle, config) {
				var $this = $(this);
				// Events
				var focus = function(){
					var $input = $(this);
					var tip = $input.attr('title');
					var val = $input.val();
					// Handle
					if (tip === val) {
						$input.val('').removeClass(config.hintedClass);
					}
					// Done
					return true;
				}
				var blur = function(){
					var $input = $(this);
					var tip = $input.attr('title');
					var val = $input.val();
					// Handle
					if (tip === val || !val) {
						$input.val('').addClass(config.hintedClass).val(tip);
					}
					// Done
					return true;
				}
				// Fetch
				var $inputs = $this.findAndSelf(config.selector).addClass(config.hasClass);
				$inputs.each(function(){
					var $input = $(this);
					$input.focus(focus).blur(blur).trigger('blur');
				});
				$this.find('form').one('submit',function(){
					$inputs.trigger('focus');
				});
				// Done
				return $this;
			}
		}
	});
	
})(jQuery);