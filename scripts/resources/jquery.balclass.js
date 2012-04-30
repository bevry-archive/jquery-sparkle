/**
 * @depends jquery, core.console
 * @name jquery.balclass
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){

	/**
	 * BalClass
	 * @version 1.5.0
	 * @date August 28, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
	 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
	 */
	if ( !($.BalClass||false) ) {
		// Constructor
		$.BalClass = function(extend){
			this.construct(extend);
		};
		// Prototype
		$.extend($.BalClass.prototype, {
			config: {
			},
			construct: function(){
				var Me = this,
					extend = {};
				// Handle
				if ( typeof arguments[0] === 'object' && typeof arguments[1] === 'object'  ) {
					// config, extend
					extend = arguments[1];
					extend.config = arguments[0]||{};
				}
				else if ( typeof arguments[0] === 'object' ) {
					// extend
					extend = arguments[0];
					extend.config = extend.config||{};
				}
				else if ( typeof arguments[0] === 'undefined' ) {
					// No arguments were passed
					extend = false;
				}
				else {
					window.console.error('BalClass.construct: Invalid Input');
				}

				// Check
				if ( extend !== false ) {
					// Configure
					Me.configure(extend.config);
					delete extend.config;

					// Extend
					$.extend(Me,extend);
				}

				// Build
				if ( typeof Me.built === 'function' ) {
					return Me.built();
				}

				// Return true
				return true;
			},
			configure: function(config){
				var Me = this;
				Me.config = Me.config||{};
				Me.config = $.extend({},Me.config,config||{}); // we want to clone
				return Me;
			},
			clone: function(extend){
				// Clone a BalClass (Creates a new BalClass type)
				var Me = this;
				var clone = function(extend){
					this.construct(extend);
				};
				$.extend(clone.prototype, Me.prototype, extend||{});
				clone.clone = clone.prototype.clone;
				clone.create = clone.prototype.create;
				return clone;
			},
			create: function(Extension){
				// Create a BalClass (Creates a new instance of a BalClass)
				var Me = this;
				var Obj = new Me(Extension);
				return Obj;
			},
			addConfig: function(name, config){
				var Me = this;
				if ( typeof config === 'undefined' ) {
					if ( typeof name === 'object' ) {
						// Series
						$.each(name,function(key,value){
							Me.applyConfig(key, value);
						});
					}
					return false;
				} else if ( typeof config === 'object' ) {
					// Single
					Me.applyConfig(name, config);
				}
				return Me;
			},
			applyConfig: function(name,config){
				var Me = this;
				Me.config[name] = Me.config[name]||{};
				$.extend(true,Me.config[name],config||{});
				return Me;
			},
			setConfig: function(name,config){
				var Me = this;
				Me.config[name] = config||{};
				return Me;
			},
			hasConfig: function(name){
				var Me = this;
				return typeof Me.config[name] !== 'undefined';
			},
			getConfig: function(name){
				var Me = this;
				if ( typeof name !== 'string' ) {
					return this.config;
				}
				return this.getConfigWith(name);
			},
			getConfigWith: function(name,config){
				var Me = this;
				if ( typeof name !== 'string' ) {
					if ( typeof config === 'undefined' ) {
						config = name;
					}
					name = 'default';
				}
				if ( typeof config !== 'object' ) {
					config = {};
				}
				var result = {};
				$.extend(true, result, Me.config[name]||{}, config||{});
				return result;
			},
			getConfigWithDefault: function(name,config){
				var Me = this;
				return Me.getConfigWith('default',Me.getConfigWith(name,config));
			},
			setDefaults: function(config){
				var Me = this;
				return Me.applyConfig('default',config);
			}
		});
		// Instance
		$.BalClass.clone = $.BalClass.prototype.clone;
		$.BalClass.create = $.BalClass.prototype.create;
		// ^ we alias these as they should be both in prototype and instance
		//   however we do not want to create a full instance yet...
	}
	else {
		window.console.warn("$.BalClass has already been defined...");
	}


})(jQuery);