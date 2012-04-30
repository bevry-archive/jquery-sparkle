/**
 * @depends jquery, core.console, jquery.balclass
 * @name jquery.balclass.datetimepicker
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){

	/**
	 * jQuery Date Time Picker
	 * @version 1.3.1
	 * @date August 20, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
	 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
	 */
	if ( !($.Datetimepicker||false) ) {
		$.Datetimepicker = $.BalClass.create({
			// Configuration
			config: {
				'default': {
					useHtml5: false,
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
			},
			// Functions
			fn: function(mode,options){
				// Prepare
				var Me = $.Datetimepicker;
				var config = Me.getConfigWithDefault(mode,options);
				// Handle
				return $(this).each(function(){
					var $input = $(this);

					// Prepare
					if ( $input.hasClass('sparkle-datetime-has') ) {
						// Already done
						return this;
					}
					$input.addClass('sparkle-datetime').addClass('sparkle-datetime-has');

					// HTML5
					if ( config.useHtml5 && Modernizr && Modernizr.inputtypes.datetime && $input.attemptTypeChangeTo('datetime') ) {
						// Chain
						return this;
					}

					// --------------------------

					// Defaults
					var value = $input.val();
					var date = new Date();
					var datestr = '', timestr = '';
					if ( value ) {
						date.setDatetimestr(value);
						datestr = date.getDatestr();
						timestr = date.getTimestr();
					}

					// --------------------------
					// DOM Manipulation

					// Hide
					$input.hide();

					// Create date part
					var $date = $('<input type="text" class="sparkle-date"/>');
					var $sep = $('<span class="sparkle-datetime-sep"> @ </span>');
					var $time = $('<input type="text" class="sparkle-time"/>');

					// Append
					$time.insertAfter($input);
					$sep.insertAfter($input);
					$date.insertAfter($input);

					// Apply
					$date.val(datestr);
					$time.val(timestr);

					// --------------------------

					// Bind
					var updateFunction = function(){
						var value = $date.val()+' '+$time.val();
						$input.val(value).trigger('change');
					};
					$date.add($time).change(updateFunction);

					// Instantiate
					$date.Datepicker(config.datepickerOptions);
					$time.Timepicker(config.timepickerOptions);

					// Chain
					return $input;
				});
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.datetimepicker = $.fn.Datetimepicker = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});
	}
	else {
		window.console.warn("$.Datetimepicker has already been defined...");
	}


})(jQuery);