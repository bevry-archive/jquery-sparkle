/**
 * @depends jquery, jquery.balclass
 * @name jquery.balclass.datetimepicker
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
	if ( !($.Help||false) ) {
		$.datetimepicker = new $.BalClass({
			'default': {
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
		});
		$.fn.datetimepicker = function(mode,options){
			// Prepare
			var Me = $.timepicker;
			var config = Me.getConfigWithDefault(mode,options);
			// Handle
			return $(this).each(function(){
				var $input = $(this);
				$input.hide();
		
				// Prepare
				if ( $input.hasClass('sparkle-datetime-has') ) return $input; // already done
				$input.addClass('sparkle-datetime').addClass('sparkle-datetime-has');
	
				// Create date part
				var $date = $('<input type="text" class="sparkle-date"/>');
				var $sep = $('<span class="sparkle-datetime-sep"> @ </span>');
				var $time = $('<input type="text" class="sparkle-time"/>');
				//var $empty = $('<label class="form-empty">or <input type="checkbox" value="true"/> empty</label>');
	
				// Defaults
				var value = $input.val();
				var date = new Date();
				var datestr = '', timestr = '';
				if ( value ) {
					date.setDatetimestr(value);
					datestr = date.getDatestr();
					timestr = date.getTimestr();
				}
		
				// Append
				//$empty.insertAfter($input);
				$time.insertAfter($input);
				$sep.insertAfter($input);
				$date.insertAfter($input);
		
				// Apply
				$date.val(datestr);
				$time.val(timestr);
		
				// Bind
				var updateFunction = function(){
					var value = $date.val()+' '+$time.val();
					$input.val(value).trigger('change');
				};
				$date.add($time).change(updateFunction);
		
				// Instantiate
				$date.datepicker(config.datepickerOptions);
				$time.timepicker(config.timepickerOptions);
		
				// Chain
				return $input;
			});
		};
	}
	else {
		console.warn("$.datetimepicker has already been defined...");
	}

	
})(jQuery);