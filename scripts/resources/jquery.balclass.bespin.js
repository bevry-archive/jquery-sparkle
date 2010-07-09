/**
 * @depends jquery, jquery.balclass
 * @name jquery.balclass.bespin
 * @package jquery-sparkle
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
	if ( !($.Help||false) ) {
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
		};
		$.fn.Bespin = function(mode,options) {
			// Alias
			return $.Bespin.fn.apply(this,[mode,options]);
		};
	}
	else {
		console.warn("$.Bespin has already been defined...");
	}


})(jQuery);