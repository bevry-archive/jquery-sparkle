/**
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