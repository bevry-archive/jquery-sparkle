/**
 * @depends nothing
 * @name core.number
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 */

/**
 * Return a new string with zeroes added correctly to the front of the number, given the threshold
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Number.prototype.zeroise = String.prototype.zeroise = String.prototype.zeroise ||function(threshold){
	var number = this,
		str = number.toString();
	if (number < 0) { str = str.substr(1, str.length) }
	while (str.length < threshold) { str = '0' + str }
	if (number < 0) { str = '-' + str }
	return str;
};

/**
 * Return a new string with the string/number padded left using [ch] of [num] length
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Number.prototype.padLeft = String.prototype.padLeft = String.prototype.padLeft ||function(ch, num){
	var val = String(this);
	var re = new RegExp('.{' + num + '}$');
	var pad = '';
	if ( !ch && ch !== 0 ) ch = ' ';
	do  {
		pad += ch;
	} while(pad.length < num);
	return re.exec(pad + val)[0];
};

/**
 * Return a new string with the string/number padded right using [ch] of [num] length
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Number.prototype.padRight = String.prototype.padRight = String.prototype.padRight ||function(ch, num){
	var val = String(this);
	var re = new RegExp('^.{' + num + '}');
	var pad = '';
	if ( !ch && ch !== 0 ) ch = ' ';
	do {
		pad += ch;
	} while (pad.length < num);
	return re.exec(val + pad)[0];
};

/**
 * Return a new number with the current number rounded to [to]
 * @version 1.0.0
 * @date June 30, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Number.prototype.roundTo = String.prototype.roundTo = String.prototype.roundTo || function(to){
	var val = String(parseInt(this,10));
	val = parseInt(val.replace(/[1,2]$/, 0).replace(/[3,4]$/, 5),10);
	return val;
};
