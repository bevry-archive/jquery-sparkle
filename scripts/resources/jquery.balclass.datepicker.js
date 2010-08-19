/**
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

	
})(jQuery);