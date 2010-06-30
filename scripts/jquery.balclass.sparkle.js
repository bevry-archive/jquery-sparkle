/**
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

})(jQuery);