/**
 * @depends jquery, core.console, jquery.extra, jquery.balclass
 * @name jquery.balclass.bespin.sparkle
 * @package jquery-sparkle
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
	 * @version 1.2.0
	 * @date July 11, 2010
	 * @since 1.0.0, June 30, 2010
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	if ( !($.Sparkle||false) ) {
		/**
		 * $.SparkleClass
		 */
		$.SparkleClass = $.BalClass.clone(
			// Class Extensions
			{
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
				applyExtensionConfig: function(extension, config) {
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
				built: function(){
					// Prepare
					var Sparkle = this;
					// Attach
					$.fn.sparkle = function(extension) {
						// Alias
						return Sparkle.fn.apply(this,[extension]);
					};
					// onDomReady
					$(function(){
						// Sparkle
						$(document.body).sparkle();
					});
					// Return true
					return true;
				}
			}
		);
		/**
		 * $.Sparkle
		 */
		$.Sparkle = $.SparkleClass.create(
			// Instance Configuration
			{
				'date': {
					config: {
						selector: '.sparkle-date',
						datepickerOptions: {
						},
						demo: '<input type="text" class="sparkle-date" />'
					},
					extension: function(Sparkle, config){
						var $this = $(this);
						
						// Fetch
						var $elements = $this.findAndSelf(config.selector);
						if ( !$elements.length ) {
							return true;
						}
						
						// Check
						if ( typeof $elements.timepicker === 'undefined' ) {
							console.warn('datepicker not loaded. Did you forget to include it?');
							return false;
						}
						
						// Apply
						$elements.datepicker(config.datepickerOptions);
						
						// Done
						return true;
					}
				},
				'time': {
					config: {
						selector: '.sparkle-time',
						timepickerOptions: {
						},
						demo: '<input type="text" class="sparkle-time" />'
					},
					extension: function(Sparkle, config){
						var $this = $(this);
						
						// Fetch
						var $elements = $this.findAndSelf(config.selector);
						if ( !$elements.length ) {
							return true;
						}
						
						// Check
						if ( typeof $elements.timepicker === 'undefined' ) {
							console.warn('timepicker not loaded. Did you forget to include it?');
							return false;
						}
						
						// Apply
						$elements.timepicker(config.timepickerOptions);
						
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
						demo: '<input type="text" class="sparkle-datetime" />'
					},
					extension: function(Sparkle, config){
						var $this = $(this);
						
						// Fetch
						var $elements = $this.findAndSelf(config.selector);
						if ( !$elements.length ) {
							return true;
						}
						
						// Check
						if ( typeof $elements.datetimepicker === 'undefined' ) {
							console.warn('datetimepicker not loaded. Did you forget to include it?');
							return false;
						}
						
						// Apply
						$elements.datetimepicker({
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
							console.warn('autogrow not loaded. Did you forget to include it?');
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
									console.warn('GSFN not loaded. Did you forget to include it?');
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
						var $this = $(this); var Sparkle = $.Sparkle;
						
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
						var $this = $(this); var Sparkle = $.Sparkle;

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
						var $this = $(this); var Sparkle = $.Sparkle;
						
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
						var $this = $(this); var Sparkle = $.Sparkle;
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
						var $this = $(this); var Sparkle = $.Sparkle;
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
						for ( var extension in Extensions ) {
							var Extension = Sparkle.getExtension(extension);
							if ( !Extension ) {
								continue;
							}
							var demo = Extension.config.demo||'';
							var demoText = Extension.config.demoText||'';
							if ( !demo && !demoText ) {
								continue;
							}
							var $demo = $(
								'<div class="sparkle-demo-section">'+
									'<h3>'+extension+'<h3>'+
								'</div>'
							);
							if ( demoText ) {
								$demo.append('<div class="sparkle-demo-text">'+demoText+'</div>');
							}
							if ( demo ) {
								var demoCode = demo.replace(/</g,'&lt;').replace(/>/g,'&gt;');
								$demo.append(
									'<h4>Example Code:</h4>'+
										'<code class="code language-html sparkle-demo-code">'+demoCode+'</code>'+
									'<h4>Example Result:</h4>'+
										'<div class="sparkle-demo-result">'+demo+'</div>'
								);
							}
							$container.append($demo).sparkle();
						}
						// Done
						return true;
					}
				}
			}
		);
	}
	else {
		console.warn("$.Sparkle has already been defined...");
	}

})(jQuery);