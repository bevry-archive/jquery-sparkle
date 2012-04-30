/**
 * Apply the function {handler} to each item in the object, ignoring inherited items.
 * Return false in the {handler} to break the cycle.
 * @param {Function} handler
 * @version 1.0.0
 * @date August 20, 2010
 * @since August 20, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Object.prototype.each = function(handler){
	// Check
	if ( typeof handler !== 'function' ) {
		throw new Exception('Object.prototype.each: Invalid input');
	}
	// Cycle
	for ( var key in this ) {
		// Check
		if ( !this.hasOwnProperty(key) ) {
			continue;
		}
		// Fire
		var value = this[key];
		if ( handler.apply(value,[key,value]) === false ) {
			break;
		}
	}
	// Chain
	return this;
}

/**
 * Extends the current object with the passed object(s), ignoring iherited properties.
 * @param {Object} ... The passed object(s) to extend the current object with
 * @version 1.0.0
 * @date August 20, 2010
 * @since August 20, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Object.prototype.extend = function(object){
	var Me = this;
	// Check
	if ( typeof object !== 'object' ) {
		throw new Exception('Object.prototype.extend: Invalid input');
	}
	// Handle
	if ( arguments.length > 1 ) {
		arguments.each(function(){
			Me.extend(this);
		});
	}
	else {
		// Extend
		object.each(function(key,object){
			if ( typeof object === 'object' && typeof Me[key] === 'object' ) {
				Me[key].extend(object);
			}
			else {
				Me[key] = object;
			}
		});
	}
	// Chain
	return this;
}

/**
 * Returns a new object which contains all the passed object(s) merged together, ignoring iherited properties.
 * @param {Object} ... The passed object(s) to extend the current object with
 * @version 1.0.0
 * @date August 20, 2010
 * @since August 20, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Object.prototype.merge = function(){
	var Me = this,
		result = {};
	// Merge
	return result.extend.apply(result,arguments);
}

/**
 * Gets the property {key} of the object
 * @param {String} key
 * @return {Unknown}
 * @version 1.0.0
 * @date August 20, 2010
 * @since August 20, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Object.prototype.get = function(key){
	return this[key];
}

/**
 * Sets the property {key} of the object to {value}
 * @param {String} key
 * @return {Unknown}
 * @version 1.0.0
 * @date August 20, 2010
 * @since August 20, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Object.prototype.set = function(key,value){
	return this[key] = value;
}

/**
 * Returns whether or not the property {key} has been set
 * @param {String} key
 * @return {Boolean}
 * @version 1.0.0
 * @date August 20, 2010
 * @since August 20, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
Object.prototype.get = function(key){
	return typeof this.key !== 'undefined';
}

/**
 * Translates a string.
 * If passed a string, will return the translation for that string.
 * If passed a second param, stores the translation of the from string to that string.
 * If passed an object, will store the translations for all items in the object.
 * @param {Object|String} from
 * @param {String|undefined} to
 * @version 1.0.0
 * @date August 20, 2010
 * @since 1.0.0, August 20, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
String.translate = function(from,to){
	// Prepare
	var	result = this,
		length = arguments.length;

	// Check
	if ( length === 1 && typeof from === 'object' ) {
		// Handle object input
		from.each(function(from,to){
			String.translate(from,to);
		});
		return this;
	}

	// Ensure
	from = String(from);

	// Apply
	if ( arguments.length === 1 || typeof to === 'undefined' ) {
		// Translate from
		return String.translate[from];
	}
	else {
		// Translate to
		return String.translate[from] = String(to);
	}
}

/**
 * Translates the string.
 * If passed a param, stores the translation of the from string to that string.
 * @param {Object|String} from
 * @param {String|undefined} to
 * @version 1.0.0
 * @date August 20, 2010
 * @since 1.0.0, August 20, 2010
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
 */
String.prototype.translate = function(to){
	return String.translate(this,to);
}
