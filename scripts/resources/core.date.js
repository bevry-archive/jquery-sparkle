/**
 * @depends nothing
 * @name core.date
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 */

/**
 * Apply the Datetime string to the current Date object
 * Datetime string in the format of "year month day hour min sec". "hour min sec" all optional.
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Date.prototype.setDatetimestr = Date.prototype.setDatetimestr || function(timestamp){
	// Set the datetime from a string
	var pieces = timestamp.split(/[\-\s\:]/g);
	var year = pieces[0];
	var month = pieces[1];
	var day = pieces[2];
	var hour = pieces[3]||0;
	var min = pieces[4]||0;
	var sec = pieces[5]||0;
	this.setUTCFullYear(year,month-1,day);
	this.setUTCHours(hour);
	this.setUTCMinutes(min);
	this.setUTCSeconds(sec);
	return this;
};

/**
 * Apply the Date string to the current Date object
 * Date string in the format of "year month day". "year month day" all optional.
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Date.prototype.setDatestr = Date.prototype.setDatestr || function(timestamp){
	// Set the date from a string
	var pieces = timestamp.split(/[\-\s\:]/g);
	var year = pieces[0]||1978;
	var month = pieces[1]||0;
	var day = pieces[2]||1;
	this.setUTCFullYear(year,month-1,day);
	return this;
};

/**
 * Apply the Time string to the current Date object
 * Time string in the format of "hour min sec". "hour min sec" all optional.
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Date.prototype.setTimestr = Date.prototype.setTimestr || function(timestamp){
	// Set the time from a string
	var pieces = timestamp.split(/[\-\s\:]/g);
	var hour = pieces[0]||0;
	var min = pieces[1]||0;
	var sec = pieces[2]||0;
	this.setUTCHours(hour);
	this.setUTCMinutes(min);
	this.setUTCSeconds(sec);
	return this;
};

/**
 * Return the Date as a Datetime string
 * Datetime string in the format of "year-month-date hours:minutes:seconds".
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Date.prototype.getDatetimestr = Date.prototype.getDatetimestr || function() {
	// Get the datetime as a string
	var date = this;
	return date.getDatestr()+' '+date.getTimestr();
};

/**
 * Return the Date as a Datetime string
 * Datetime string in the format of "year-month-date".
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Date.prototype.getDatestr = Date.prototype.getDatestr || function() {
	// Get the date as a string
	var date = this;
	var year = date.getUTCFullYear();
	var month = (this.getUTCMonth() + 1).padLeft(0,2);
	var date = this.getUTCDate().padLeft(0,2);
	return year+'-'+month+'-'+date;
};

/**
 * Return the Date as a Datetime string
 * Datetime string in the format of "hours:minutes:seconds".
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Date.prototype.getTimestr = Date.prototype.getTimestr || function(){
	// Get the time as a string
	var date = this;
	var hours = date.getUTCHours().padLeft(0,2);
	var minutes = date.getUTCMinutes().padLeft(0,2);
	var seconds = date.getUTCSeconds().padLeft(0,2);
	return hours+':'+minutes+':'+seconds;
};

/**
 * Return the Date as a ISO 8601 date string
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Date.prototype.getDatetime = String.prototype.getDatetime || function(){
	// Get a ISO 8601 date
	var now = this;
	var datetime = now.getUTCFullYear() + '-' +
		(now.getUTCMonth()+1).zeroise(2) + '-' +
		now.getUTCDate().zeroise(2) + 'T' +
		now.getUTCHours().zeroise(2) + ':' +
		now.getUTCMinutes().zeroise(2) + ':' +
		now.getUTCSeconds().zeroise(2) + '+00:00';
	return datetime;
};
