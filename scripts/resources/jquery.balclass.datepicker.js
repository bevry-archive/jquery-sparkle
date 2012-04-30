/**
 * @depends jquery, core.console, jquery.balclass
 * @name jquery.balclass.datepicker
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
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
     * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
	 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
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