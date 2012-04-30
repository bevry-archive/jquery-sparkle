/**
 * @depends jquery, core.console, jquery.balclass, tinymce
 * @name jquery.balclass.tinymce
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){

	/**
	 * jQuery TinyMCE Extender
	 * @version 1.2.1
	 * @date August 20, 2010
	 * @since 1.0.0, June 30, 2010
     * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
	 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
	 */
	if ( !($.Tinymce||false) ) {
		$.Tinymce = $.BalClass.create({
			// Configuration
			config: {
				'default': {
					// Location of TinyMCE script
					script_url: '/scripts/tiny_mce/tiny_mce.js',

					// General options
					theme: "advanced",
					plugins: "autoresize,safari,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template",

					// Theme options
					theme_advanced_buttons1: "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect,fontselect,fontsizeselect,|,code,",
					theme_advanced_buttons2: "cut,copy,paste,pastetext,pasteword,|,undo,redo,|,link,unlink,image,|,preview,|,forecolor,backcolor,|,bullist,numlist,|,outdent,indent,blockquote,|,fullscreen",
					theme_advanced_buttons3: "tablecontrols,|,hr,removeformat,visualaid,|,sub,sup",
					theme_advanced_toolbar_location: "top",
					theme_advanced_toolbar_align: "left",
					theme_advanced_statusbar_location: "bottom",
					theme_advanced_path: false,
					theme_advanced_resizing: false,
					width: "100%",

					// Compat
					//add_form_submit_trigger: false,
					//submit_patch: false,

					// Example content CSS (should be your site CSS)
					// content_css : "css/content.css",

					// Replace values for the template plugin
					template_replace_values: {

					}
				},
				'rich': {
				},
				'simple': {
					theme_advanced_buttons2: "",
					theme_advanced_buttons3: ""
				}
			},
			// Functions
			fn: function(mode,options) {
				var Me = $.Tinymce;
				var config = Me.getConfigWithDefault(mode,options);
				var $this = $(this);
				// Apply + Return
				return $this.tinymce(config);
			},
			built: function(){
				// Prepare
				var Me = this;
				// Attach
				$.fn.Tinymce = function(mode,options) {
					// Alias
					return Me.fn.apply(this,[mode,options]);
				};
				// Return true
				return true;
			}
		});
	}
	else {
		window.console.warn("$.Tinymce has already been defined...");
	}

})(jQuery);