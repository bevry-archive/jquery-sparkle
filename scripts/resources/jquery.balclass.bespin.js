/**
 * @depends jquery, core.console, jquery.balclass, bespin
 * @name jquery.balclass.bespin
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
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
     * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
	 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
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


})(jQuery);