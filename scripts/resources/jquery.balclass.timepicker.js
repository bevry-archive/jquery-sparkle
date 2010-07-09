/**
 * @depends jquery, jquery.balclass
 * @name jquery.balclass.timepicker
 * @package jquery-sparkle
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery Time Picker
	 * @version 1.0.0
	 * @date June 30, 2010
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	if ( !($.timepicker||false) ) {
		/**
		 * $.timepicker
		 */
		$.timepicker = new $.BalClass({
			'default': {
				timeConvention: 24
			},
			'12hr': {
				timeConvention: 12
			},
			'24hr': {
				timeConvention: 24
			}
		});
		$.fn.timepicker = function(mode,options){
			// Prepare
			var Me = $.timepicker;
			var config = Me.getConfigWithDefault(mode,options);
			// Handle
			return $(this).each(function(){
				var $input = $(this);
				$input.hide();
		
				// Prepare
				if ( $input.hasClass('sparkle-time-has') ) return $input; // already done
				$input.addClass('sparkle-time').addClass('sparkle-time-has');
		
				// Generate
				var $hours = $('<select class="sparkle-time-hours" />');
				for ( var hours=12,hour=1; hour<=hours; ++hour ) {
					$hours.append('<option value="'+hour+'">'+hour.padLeft('0',2)+'</option>');
				}
				var $minutes = $('<select class="sparkle-time-minutes" />');
				for ( var mins=55,min=0; min<=mins; min+=5) {
					$minutes.append('<option value="'+min+'">'+min.padLeft('0',2)+'</option>');
				}
				var $meridian = $('<select class="sparkle-time-meridian" />');
				$meridian.append('<option>am</option>');
				$meridian.append('<option>pm</option>');
		
				// Defaults
				var value = $input.val(),
					date = new Date(),
					hours = '12',
					minutes = '0',
					meridian = 'am';
				if ( value ) {
					date.setTimestr(value);
					hours = date.getUTCHours();
					minutes = date.getUTCMinutes();
					if ( hours > 12 ) {
						hours -= 12; meridian = 'pm';
					}
				}
		
				// Append
				$meridian.insertAfter($input);
				$minutes.insertAfter($input);
				$hours.insertAfter($input);
		
				// Apply
				if ( hours > 12 && meridian == 'pm' ) hours -= 12;
				$hours.val(hours);
				$minutes.val(minutes.roundTo(5));
				$meridian.val(meridian);
		
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
	}
	else {
		console.warn("$.timepicker has already been defined...");
	}

	
})(jQuery);