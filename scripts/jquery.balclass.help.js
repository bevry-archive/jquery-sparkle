/**
 * @depends jquery, balclass.js
 */

/**
 * jQuery Aliaser
 */
(function($){
	
	/**
	 * jQuery Help
	 * @depends BalClass
 	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://www.balupton.com}
 	 * @license GNU Affero General Public License - {@link http://www.gnu.org/licenses/agpl.html}
	 */
	$.Help = new $.BalClass({
		'default': {
			// Elements
			wrap: '<span class="sparkle-help-wrap"/>',
			icon: '<span class="sparkle-help-icon"/>',
			text: '<span class="sparkle-help-text"/>',
			parentClass: '',
			title: ''
		}
	});
	$.fn.help = function(options){
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
	}


})(jQuery);