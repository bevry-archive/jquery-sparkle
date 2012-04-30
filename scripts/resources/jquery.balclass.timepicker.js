/**
 * @depends jquery, core.console, jquery.balclass
 * @name jquery.balclass.timepicker
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){

	/**
	 * jQuery Time Picker
	 * @version 1.3.1
	 * @date August 20, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
	 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
	 */
	if ( !($.Timepicker||false) ) {
		/**
		 * $.timepicker
		 */
		$.Timepicker = $.BalClass.create({
			// Configuration
			config: {
				'default': {
					useHtml5: false,
					timeConvention: 12
				},
				'12hr': {
					timeConvention: 12
				},
				'24hr': {
					timeConvention: 24
				}
			},
			// Functions
			fn: function(mode,options){
				// Prepare
				var Me = $.Timepicker;
				var config = Me.getConfigWithDefault(mode,options);
				// Handle
				return $(this).each(function(){
					var $input = $(this);

					// Prepare
					if ( $input.hasClass('sparkle-time-has') ) {
						// Already done
						return this;
					}
					$input.addClass('sparkle-time').addClass('sparkle-time-has');

					// HTML5
					if ( config.useHtml5 && Modernizr && Modernizr.inputtypes.date && $input.attemptTypeChangeTo('time') ) {
						// Chain
						return this;
					}

					// --------------------------

					// Defaults
					var value = $input.val(),
						date = new Date(),
						timeConvention = config.timeConvention,
						hours = 12,
						minutes = 0,
						meridian = 'am';

					// Assign
					if ( value ) {
						date.setTimestr(value);
						hours = date.getUTCHours();
						minutes = date.getUTCMinutes();
					}

					// Adjust
					if ( timeConvention === 12 && hours > 12 ) {
						meridian = 'pm';
						hours -= 12;
					}
					minutes = minutes.roundTo(5);

					// Check
					if ( timeConvention === 12 ) {
						if ( hours > 12 || hours < 1 ) {
							hours = 1;
							window.console.warn('timepicker.fn: Invalid Hours.', [this,arguments]);
						}
					}
					else {
						if ( hours > 23 || hours < 0 ) {
							hours = 1;
							window.console.warn('timepicker.fn: Invalid Hours.', [this,arguments]);
						}
					}
					if ( minutes > 60 || minutes < 0 ) {
						minutes = 0;
						window.console.warn('timepicker.fn: Invalid Minutes.', [this,arguments]);
					}

					// --------------------------
					// DOM Manipulation

					// Hide
					$input.hide();

					// Meridian
					if ( timeConvention === 12 ) {
						var $meridian = $('<select class="sparkle-time-meridian" />');
						$meridian.append('<option>am</option>');
						$meridian.append('<option>pm</option>');
						$meridian.val(meridian).insertAfter($input);
					}

					// Minutes
					var $minutes = $('<select class="sparkle-time-minutes" />');
					for ( var mins=55,min=0; min<=mins; min+=5) {
						$minutes.append('<option value="'+min+'">'+min.padLeft('0',2)+'</option>');
					}
					$minutes.val(minutes).insertAfter($input);

					// Hours
					var $hours = $('<select class="sparkle-time-hours" />');
					if ( timeConvention === 12 ) {
						for ( var hours=timeConvention,hour=1; hour<=hours; ++hour ) {
							$hours.append('<option value="'+hour+'">'+hour.padLeft('0',2)+'</option>');
						}
						$hours.val(hours-1).insertAfter($input);
					}
					else {
						for ( var hours=timeConvention,hour=0; hour<hours; ++hour ) {
							$hours.append('<option value="'+hour+'">'+hour.padLeft('0',2)+'</option>');
						}
						$hours.val(hours).insertAfter($input);
					}

					// --------------------------

					// Bind
					var updateFunction = function(){
						var hours = parseInt($hours.val(),10);
						var minutes = $minutes.val();
						if ( timeConvention === 12 ) {
							var meridian = $meridian.val();

							// PM Adjustment
							if ( hours !== 12 && meridian === 'pm' ) {
								hours += 12;
							}

							// AM Adjustment
							if ( hours === 12 && meridian === 'am' ) {
								hours = 0;
							}
						}

						// Apply
						var value = hours.padLeft(0,2)+':'+minutes.padLeft(0,2)+':00';
						$input.val(value).trigger('change');
					};
					$hours.add($minutes).add($meridian).change(updateFunction);
					$input.parent('form:first').submit(updateFunction);

					// Done
					return $input;
				});
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.timepicker = $.fn.Timepicker = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});
	}
	else {
		window.console.warn("$.Timepicker has already been defined...");
	}


})(jQuery);