/**
 * @depends jquery
 * @name jquery.ajaxcalendar
 * @package jquery-sparkle
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * Ajax Calendar
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @since 2009
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	if ( !($.fn.ajaxCalendar||false) ) {
		$.fn.ajaxCalendar = $.fn.ajaxCalendar || function(options){
			// Group?
			var $calendar = $(this);
			if ( $calendar.length > 1 ) {
				$calendar.each(function(){
					$(this).ajaxCalendar(options);
				});
				return this;
			}
	
			// Prepare
			options = options||{};
			options.ajaxList = options.ajaxList||"entries";
			options.ajaxUrl = options.ajaxUrl||'/ajax-calendar';
			options.ajaxData = options.ajaxData||{};
			options.dayEntryClass = options.dayEntryClass||'has-entry';
			options.domEvents = options.domEvents||{};
			options.datepickerOptions = options.datepickerOptions||{};
			options.useCache = typeof options.useCache === 'undefined' ? true : options.useCache;
			options.disableClick = typeof options.disableClick === 'undefined' ? false : options.disableClick;
	
			// Calendar Entries Setup/Fetch
			var calendarEntries = {};//$calendar.data('calendarEntries')||{};
	
			// Our Checker
			var calendarEntriesExist = function(year,month) {
				return typeof calendarEntries[year+'-'+month] !== 'undefined';
			};
	
			// Our Getter
			var calendarEntriesGet = function(year,month) {
				return calendarEntries[year+'-'+month]||[];
			};
	
			// Our Setter
			var calendarEntriesSet = function(year,month,entries){
				calendarEntries[year+'-'+month] = entries||[];
				return true;
			};
	
			// Our Store
			var calendarEntriesStore = function(){
				//$calendar.data('calendarEntries',calendarEntries);
				return true;
			}
	
			// Our Extender Event
			var calendarEntriesRender = function(datepicker, year, month) {
				// Fetch the Entries
				var entries = calendarEntriesGet(year,month),
					$datepicker = $(datepicker);
		
				// Reset the Render
				var $days_tds = $datepicker.find('tbody td');
				var $days = $days_tds.find('a');
		
				// Disable Click
				if ( options.disableClick ) {
					$days_tds.unbind('click').removeAttr('onclick');
					$days.removeAttr('href').css('cursor','default');
				}
		
				// Cycle Through Entries
				$.each(entries, function(entryIndex,entry){
					var startMonth = entry.start.match(/-([0-9]+)-/)[1].stripLeft('0'),
					 	finishMonth = entry.finish.match(/-([0-9]+)-/)[1].stripLeft('0'),
						startDay = entry.start.match(/([0-9]+)\s/)[1].stripLeft('0'),
						finishDay = entry.finish.match(/([0-9]+)\s/)[1].stripLeft('0');
					var $startDay = startMonth == month ? $days.filter(':contains('+startDay+'):first') : $days.filter(':first'),
						$finishDay = finishMonth == month ? $days.filter(':contains('+finishDay+'):first') : $days.filter(':last');
			
					// Indexes
					var start = startMonth == month ? $days.index($startDay) : 0,
						finish = finishMonth == month ? $days.index($finishDay) : $days.length-1,
						duration = finish-start+1; // +1 to be inclusive
			
					// Betweens
					var $entryDays = [];
					if ( start == finish ) {
						$entryDays = $startDay;
					} else if ( start == finish-1 ) {
						$entryDays = $startDay.add($finishDay);
					} else {
						$entryDays = $startDay.add($days.filter(':lt('+(finish)+')').filter(':gt('+(start)+')')).add($finishDay);
					}
			
					// Add the Entry to These Days
					$entryDays.addClass(options.dayEntryClass).each(function(dayIndex,dayElement){
						var $day = $(dayElement);
						var day = $day.text().trim();
						var dayEntriesIds = $day.data('dayEntriesIds');
				
						// Handle
						if ( typeof dayEntriesIds === 'undefined' ) {
							dayEntriesIds = entryIndex;
						} else {
							dayEntriesIds = String(dayEntriesIds).split(/,/g);
							dayEntriesIds.push(entryIndex);
							dayEntriesIds = dayEntriesIds.join(',');
						}
				
						// Apply
						$day.data('dayEntriesIds',dayEntriesIds);
				
						// Bind Entries
						$.each(options.domEvents,function(domEventName,domEventHandler){
							$day.unbind(domEventName).bind(domEventName,function(domEvent){
								// Prepare
								var $day = $(this);
								var day = $day.text().trim();
								var dayEntriesIds = String($day.data('dayEntriesIds')).split(/,/g);

								// Entries
								var dayEntries = []
								$.each(dayEntriesIds,function(i,entryIndex){
									var dayEntry = entries[entryIndex];
									dayEntries.push(dayEntry);
								});
						
								// Fire
								domEventHandler.apply(this, [domEvent, day, dayEntries, entries]);
						
								// Done
								return true;
							});
						});
				
						// Done
					});
				});
		
				// Done
				return true;
			};
	
			// Change Month Year
			var calendarChangeMonthYear = function(year, month, inst) {
				// Prepare
				var url = options.ajaxUrl,
					data = $.extend({},{
							year: year,
							month: month
						},
						options.ajaxData
					);
				var datepicker = inst.dpDiv;
		
				// Check
				if ( options.useCache && calendarEntriesExist(year,month) ) {
					// Use the cache
					setTimeout(function(){
						calendarEntriesRender(datepicker, year,month)
					},50);
				}
				else {
					// Fetch into the cache
					$.ajax({
						url:  url,
						method: 'post',
						dataType: 'json',
						data: data,
						success: function(data, status){
							// Cycle
							var entries = data[options.ajaxList]||[];
				
							// Store the Entries in the Calendar Data
							calendarEntriesSet(year,month,entries);
							calendarEntriesStore();
				
							// Apply the Entries
							calendarEntriesRender(datepicker, year,month);
						}
					});
				}
		
				// Done Change
				return true;
			}
	
			// Calendar Options
			var datepickerOptions = $.extend({}, options.datepickerOptions, {
				onChangeMonthYear: function(year, month, inst) {
					return calendarChangeMonthYear(year,month,inst);
				},
				beforeShow: function(input, inst) {
					setTimeout(function(){
						return calendarChangeMonthYear(inst.drawYear,inst.drawMonth+1,inst);
					},1000);
				}
			});
	
			// Apply Options so we can hook into the events
			$calendar.datepicker(datepickerOptions);
	
			// Chain
			return $calendar;
		};
	}
	else {
		console.warn("$.fn.ajaxCalendar has already been defined...");
	}


})(jQuery);