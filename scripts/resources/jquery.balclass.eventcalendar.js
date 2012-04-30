/**
 * @depends jquery, core.console, jquery.balclass
 * @name jquery.balclass.eventcalendar
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){

	/**
	 * Event Calendar
	 * @version 1.2.1
	 * @date August 20, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
	 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
	 */
	if ( !($.EventCalendar||false) ) {
		$.EventCalendar = $.BalClass.create({
			// Configuration
			config: {
				// Default Mode
				"default": {
					// Ajax Variables
					/** The JSON variable that will be return on the AJAX request which will contain our entries */
					ajaxEntriesVariable: 'entries',
					/** The AJAX url to request for our entries */
					ajaxEntriesUrl: '',
					/** The JSON Object to send via POST to our AJAX request */
					ajaxPostData: {},
					/** Whether or not to Cache the AJAX data */
					ajaxCache: true,

					// Data Variables
					/* If you are not using AJAX, you can define your entries here */
					calendarEntries: [],

					// Customisation Variables
					/** The CSS class which will be assigned to the Event Calendar */
					calendarClass: 'hasEventCalendar',
					/** The CSS class which will be assigned to day when the day contains a entry */
					dayEventClass: 'ui-state-active hasEvent',
					/** The standard options to send to the datepicker */
					datepickerOptions: {},
					/** Whether or not to disable the datepicker date selection click */
					disableClick: true,
					/**
					 * Whatever events you would like to assign to a $day
					 * You will recieve the arguments: domEvent, day, dayEntries, entries
					 */
					domEvents: {}
				}
			},
			// Functions
			/**
			 * jQuery Object Function
			 */
			fn: function(mode,options){
				var EventCalendar = $.EventCalendar;

				// Group?
				var $calendar = $(this);
				if ( $calendar.length > 1 ) {
					$calendar.each(function(){
						$(this).EventCalendar(mode,options);
					});
					return this;
				}

				// Prepare
				var Me = $.EventCalendar;
				var config = Me.getConfigWithDefault(mode,options);

				// Initialise
				var Entries = {
					/**
					 * Calendar Entries Stored by {entryId:entry}
					 */
					entriesById: {},

					/**
					 * Calendar Entries Stored by {"year-month":[entry,entry]}
					 */
					entriesByYearMonth: {},

					/**
					 * Whether or not the "year-month" is cacheable
					 */
					cacheableByYearMonth: {},

					/**
					 * Get whether or not a "year-month" is cacheable
					 */
					isCacheable: function(year,month,value){
						return (this.cacheableByYearMonth[year+'-'+month]||false) ? true : false;
					},

					/**
					 * Set whether or not a "year-month" is cacheable
					 */
					setCacheable: function(year,month,value){
						if ( typeof value === 'undefined' ) value =
						this.cacheableByYearMonth[year+'-'+month] = value;
						return this;
					},

					/**
					 * Calendar Entries Undefined
					 */
					isYearMonthSet: function(year,month) {
						return typeof this.entriesByYearMonth[year+'-'+month] !== 'undefined';
					},

					/**
					 * Calendar Entries Empty
					 */
					isYearMonthEmpty: function(year,month) {
						var notempty =
							(typeof this.entriesByYearMonth[year+'-'+month] === 'array' && this.entriesByYearMonth[year+'-'+month].length !== 0) ||
							(typeof this.entriesByYearMonth[year+'-'+month] === 'object' && !$.isEmptyObject(this.entriesByYearMonth[year+'-'+month]))
						;
						return !notempty;
					},

					/**
					 * Calendar Entries Getter
					 */
					getEntriesByYearMonth: function(year,month) {
						return this.entriesByYearMonth[year+'-'+month]||[];
					},

					/**
					 * Calendar Entries Getter
					 */
					getEntryById: function(id) {
						return this.entriesById[id]||undefined;
					},

					/**
					 * Get Days in a Month by passing a date
					 */
					getDaysInMonth: function(date){
						// http://snippets.dzone.com/posts/show/2099
						return 32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate();
					},

					/**
					 * Get Date
					 */
					getDate: function(timestamp){
						// Convert
						var date;
						if ( typeof timestamp === 'string' ) {
							date = new Date(timestamp);
						}
						else if ( typeof timestamp === 'number' ) {
							date = new Date();
							date.setTime(timestamp);
						}
						else if ( typeof timestamp === 'object' ) {
							date = new Date();
							date.setTime(timestamp.getTime());
						}
						else {
							throw Error("Unknown date format.");
						}

						// Fix for Firefox
						if ( isNaN(date) || date.toString() === "Invalid Date" ) {
							date = new Date();
							date.setDatetimestr(timestamp);
						}

						// Return date
						return date;
					},

					/**
					 * Calendar Entries Setter
					 */
					addEntries: function(entries) {
						// Prepare
						var Me = this;

						// Add
						$.each(entries,function(index,entry){
							// Prepare
							entry.id = entry.id||index;

							// Add Entry
							Me.addEntry(entry);
						});

						// Chain
						return true;
					},

					/**
					 * Calendar Entries Setter
					 */
					addEntry: function(entry) {
						// Prepare entry
						entry.start = this.getDate(entry.start);
						entry.finish = this.getDate(entry.finish);

						// Cycle through years and months
						var currentDate = this.getDate(entry.start);
						currentDate.setDate(1); currentDate.setHours(0); currentDate.setMinutes(0); currentDate.setSeconds(0); currentDate.setMilliseconds(0);
						var finishDate = this.getDate(entry.finish);
						finishDate.setDate(2); finishDate.setHours(0); finishDate.setMinutes(0); finishDate.setSeconds(0); finishDate.setMilliseconds(0);
						while ( currentDate < finishDate ) {
							// Fetch
							var year = currentDate.getFullYear(),
								month = currentDate.getMonth()+1;

							/*
							// Add
							entry.span = entry.span||{};
							entry.span[year] = entry.span[year]||{};
							entry.span[year][month] = entry.span[year][month]||{};

							// Cycle through days
							// Determine span
							var firstMonth = (year === entry.start.getFullYear() && month === entry.start.getMonth()+1),
								lastMonth = (year === entry.finish.getFullYear() && month === entry.finish.getMonth()+1),
								daysInMonth = this.getDaysInMonth(currentDate);
							// Ifs
							if ( firstMonth && lastMonth ) {
								// First + Last
								// Get days between (inclusive)
								var startDay = entry.start.getDate(),
									finishDay = entry.finish.getDate();
							else if (  ) {
								// First
								// Get days from (inclusive)
								var startDay = entry.start.getDate(),
									finishDay = daysInMonth;
							}
							else if (  ) {
								// Last
								// Get days to (inclusive)
								var startDay = 1,
									finishDay = entry.finish.getDate();
							}
							else {
								// Intermediate
								// Get all days
								var startDay = 1,
									finishDay = daysInMonth;
							}
							// Apply
							for ( var day = startDay; day<=finishDay; ++day ) {
								entry.span[year][month][day] = true;
							}
							*/

							// Add to Year-Month Indexed
							if ( typeof this.entriesByYearMonth[year+'-'+month] === 'undefined' ) {
								this.entriesByYearMonth[year+'-'+month] = {};
							}
							this.entriesByYearMonth[year+'-'+month][entry.id] = entry;

							// Increment date by one month
							if ( month === 11 ) {
								currentDate.setMonth(0);
								currentDate.setYear(year+1);
							}
							else {
								currentDate.setMonth(month+1);
							}
						}

						// Add to ID Indexed
						this.entriesById[entry.id] = entry;

						// Return entry
						return entry;
					}
				};

				// Add the passed entries (if any)
				Entries.addEntries(config.calendarEntries);

				// Our Extender Event
				var calendarEntriesRender = function(datepicker, year, month) {
					// Fetch the Entries
					var monthEntries = Entries.getEntriesByYearMonth(year,month),
						$datepicker = $(datepicker);

					// Reset the Render
					var $days_tds = $datepicker.find('tbody td'),
						$days = $days_tds.find('a');

					// Disable Click
					if ( config.disableClick ) {
						$days_tds.unbind('click').removeAttr('onclick');
						$days.removeAttr('href').css('cursor','default');
					}

					// Cycle Through Entries
					$.each(monthEntries, function(entryIndex,entry){
						// Fetch stat and finish days
						var startMonth = entry.start.getMonth()+1,
						 	finishMonth = entry.finish.getMonth()+1,
							startDay = entry.start.getDate(),
							finishDay = entry.finish.getDate();

						// Determine start and finish days in the rendered calendar
						var $startDay = startMonth == month ? $days.filter(':contains('+startDay+'):first') : $days.filter(':first'),
							$finishDay = finishMonth == month ? $days.filter(':contains('+finishDay+'):first') : $days.filter(':last');

						// Determine the indexes
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
						$entryDays.addClass(config.dayEventClass).each(function(dayIndex,dayElement){
							// Fetch
							var $day = $(dayElement),
								day = $day.text().trim(),
								dayEntriesIds = $day.data('dayEntriesIds');

							// Handle
							if ( typeof dayEntriesIds === 'undefined' ) {
								dayEntriesIds = entry.id;
							} else {
								dayEntriesIds = String(dayEntriesIds).split(/,/g);
								dayEntriesIds.push(entry.id);
								dayEntriesIds = dayEntriesIds.join(',');
							}

							// Apply
							$day.data('dayEntriesIds',dayEntriesIds);

							// Bind Entries
							$.each(config.domEvents,function(domEventName,domEventHandler){
								$day.unbind(domEventName).bind(domEventName,function(domEvent){
									// Prepare
									var $day = $(this),
										day = $day.text().trim(),
										dayEntriesIds = String($day.data('dayEntriesIds')).split(/,/g),
										date = new Date(); date.setDatestr(year+'-'+month+'-'+day);

									// Entries
									var dayEntries = []
									$.each(dayEntriesIds,function(i,entryId){
										var dayEntry = Entries.getEntryById(entryId);
										dayEntries.push(dayEntry);
									});

									// Fire
									domEventHandler.apply(this, [domEvent, {
										"year":year,
										"month":month,
										"day":day,
										"date":date,
										"dayEntries":dayEntries,
										"monthEntries":monthEntries,
										"datepicker":datepicker
									}]);

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
					var datepicker = inst.dpDiv||inst;

					// Check
					if ( typeof config.ajaxEntriesUrl === 'string' && config.ajaxEntriesUrl.length ) {
						// Ajax Enabled
						if ( config.ajaxCache && Entries.isCacheable(year,month) && !Entries.isYearMonthEmpty(year,month) ) {
							// We can use the cache
							// And we have entries
							setTimeout(function(){
								calendarEntriesRender(datepicker, year, month)
							},50);
						}
						else {
							// Prepare
							var data = $.extend({},{
									year: year,
									month: month
								},
								config.ajaxPostData
							);
							// Fetch into the cache
							$.ajax({
								"url":  config.ajaxEntriesUrl,
								"method": 'post',
								"dataType": 'json',
								"data": data,
								success: function(data, status){
									// Cycle
									var entries = data[config.ajaxEntriesVariable]||[];

									// Enable caching for this year month
									Entries.setCacheable(year,month,true)

									// Check if we have entries
									if ( entries.length === 0 ) {
										return true;
									}

									// Store the Entries in the Calendar Data
									Entries.addEntries(entries);

									// Render the year and month, as we have new data
									setTimeout(function(){
										calendarEntriesRender(datepicker, year, month)
									},50);

									// Done
									return true;
								},
								error: function(XMLHttpRequest, textStatus, errorThrown, response_data){
									// Error
									window.console.warn('$.EventCalendar.calendarChangeMonthYear.ajax.error:', [this, arguments]);
								}
							});
						}
					}
					else if ( !Entries.isYearMonthEmpty(year,month) ) {
						// We are not using cache
						// And we have entries
						setTimeout(function(){
							calendarEntriesRender(datepicker, year, month)
						},50);
					}

					// Done
					return true;
				};

				// Prepare initial render
				var calendarInitialised = false;
				var calendarInit = function(year,month,inst){
					// Prepare
					if ( calendarInitialised ) return;
					calendarInitialised = true;
					// Apply
					$(inst).addClass(config.calendarClass);
					calendarChangeMonthYear(year, month, inst);
				};

				// Calendar Options
				var datepickerOptions = $.extend({}, config.datepickerOptions, {
					onChangeMonthYear: function(year, month, inst) {
						// Our Event
						calendarChangeMonthYear(year,month,inst);
						// Users' Event
						if ( typeof config.datepickerOptions.onChangeMonthYear === 'function' ) {
							calendarInit(year,month,inst);
						}
					},
					beforeShow: function(input, inst) {
						datepickerShowed = true;
						// Users' Event
						if ( typeof config.datepickerOptions.beforeShow === 'function' ) {
							config.datepickerOptions.beforeShow.apply(this,[input,inst]);
						}
						// Our Event
						setTimeout(function(){
							calendarInit(inst.drawYear, inst.drawMonth+1, inst);
						},1000);
					}
				});

				// Apply Options so we can hook into the events
				$calendar.datepicker(datepickerOptions);

				// Fallback in case beforeShow fails us
				setTimeout(function(){
					var date = $calendar.datepicker("getDate");
					calendarInit(date.getFullYear(), date.getMonth()+1, $calendar);
				},2000);

				// Chain
				return $calendar;
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.EventCalendar = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});
	}
	else {
		window.console.warn("$.EventCalendar has already been defined...");
	}


})(jQuery);