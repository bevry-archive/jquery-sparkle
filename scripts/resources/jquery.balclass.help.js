/**
 * @depends jquery, core.console, jquery.balclass
 * @name jquery.balclass.help
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){

	/**
	 * jQuery Help
	 * @version 1.2.1
	 * @date August 20, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
	 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
	 */
	if ( !($.Help||false) ) {
		$.Help = $.BalClass.create({
			// Configuration
			config: {
				'default': {
					// Elements
					wrap: '<span class="sparkle-help-wrap"/>',
					icon: '<span class="sparkle-help-icon"/>',
					text: '<span class="sparkle-help-text"/>',
					parentClass: '',
					title: ''
				}
			},
			// Functions
			fn: function(options){
				var Me = $.Help;
				if ( typeof options === 'string' ) {
					options = {
						title: options
					};
				}
				var config = Me.getConfigWithDefault('default',options);
				// Fetch
				var $this = $(this);
				var $wrap = $(config.wrap);
				var $icon = $(config.icon);
				var $text = $(config.text);
				var $parent = $this.parent().addClass(config.parentClass);
				// Build
				var $contents = $this.contents();
				$this.append($wrap.append($text).append($icon));
				$contents.appendTo($text);
				$this.attr('title', config.title);
				// Done
				return $this;
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.help = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});
	}
	else {
		window.console.warn("$.Help has already been defined...");
	}


})(jQuery);