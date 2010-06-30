/**
 * @depends jquery
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * Bind a event, with or without data
	 * Benefit over $.bind, is that $.binder(event, callback, false|{}|''|false) works.
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.binder = $.fn.binder || function(event, data, callback){
		// Help us bind events properly
		var $this = $(this);
		// Handle
		if ( (callback||false) ) {
			$this.bind(event, data, callback);
		} else {
			callback = data;
			$this.bind(event, callback);
		}
		// Chain
		return $this;
	};
	
	/**
	 * Bind a event only once
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.once = $.fn.once || function(event, data, callback){
		// Only apply a event handler once
		var $this = $(this);
		// Handle
		if ( (callback||false) ) {
			$this.unbind(event, callback);
			$this.bind(event, data, callback);
		} else {
			callback = data;
			$this.unbind(event, callback);
			$this.bind(event, callback);
		}
		// Chain
		return $this;
	};
	
	/**
	 * Event for pressing the enter key
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.enter = $.fn.enter || function(data,callback){
		return $(this).binder('enter',data,callback);
	};
	$.event.special.enter = $.event.special.cancel || {
		setup: function( data, namespaces ) {
			$(this).bind('keypress', $.event.special.enter.handler);
		},
		teardown: function( namespaces ) {
			$(this).unbind('keypress', $.event.special.enter.handler);
		},
		handler: function( event ) {
			// Prepare
			var $el = $(this);
			// Setup
			if ( event.keyCode !== 13 ) { // Enter
				return;
			}
			// Fire
			event.type = 'cancel';
			$.event.handle.apply(this, arguments);
			return true;
		}
	};
	
	/**
	 * Event for pressing the escape key
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.cancel = $.fn.cancel || function(data,callback){
		return $(this).binder('cancel',data,callback);
	};
	$.event.special.cancel = $.event.special.cancel || {
		setup: function( data, namespaces ) {
			$(this).bind('keypress', $.event.special.cancel.handler);
		},
		teardown: function( namespaces ) {
			$(this).unbind('keypress', $.event.special.cancel.handler);
		},
		handler: function( event ) {
			// Prepare
			var $el = $(this);
			// Setup
			if ( event.keyCode !== 27 ) { // ESC
				return;
			}
			// Fire
			event.type = 'cancel';
			$.event.handle.apply(this, arguments);
			return true;
		}
	};
	
	/**
	 * Event for performing a singleclick
	 * @version 1.0.0
	 * @date June 30, 2010
	 * @copyright Benjamin "balupton" Lupton (MIT Licenced)
	 */
	$.fn.singleclick = $.fn.singleclick || function(data,callback){
		return $(this).binder('singleclick',data,callback);
	};
	$.event.special.singleclick = $.event.special.singleclick || {
		setup: function( data, namespaces ) {
			$(this).bind('click', $.event.special.singleclick.handler);
		},
		teardown: function( namespaces ) {
			$(this).unbind('click', $.event.special.singleclick.handler);
		},
		handler: function( event ) {
			// Prepare
			var $el = $(this);
			// Setup
			$el.data('clicking', $el.data('clicking')||'no');
			if ( $el.data('clicking') === 'yes' ) {
				return;
			} else {
				$el.data('clicking', 'yes');
				setTimeout(function(){
					$el.data('clicking', 'no');
				},	500);
			}
			// Fire
			event.type = 'singleclick';
			$.event.handle.apply(this, arguments);
			return true;
		}
	};
	

})(jQuery);