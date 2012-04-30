/**
 * @depends jquery
 * @name jquery.passwordstrength
 * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
 */

/**
 * jQuery Aliaser
 */
(function($){

	/**
	 * String.prototype.passwordStrength
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
	 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
	 */
	String.prototype.passwordstrength = String.prototype.passwordstrength || function(confirm,username){
		var password = this.toString(), symbolSize = 0, natLog, score;
		confirm = confirm||'';
		username = username||'';

		// Short
	    if ( password.length < 4 ) {
			return "short";
		};

	    // Username
	    if ( username.length && password.toLowerCase() == username.toLowerCase()) {
			return "username";
		}

	    // Confirm
	    if ( confirm.length && password != confirm ) {
			return "mismatch";
		}

		// Strength
		if ( password.match(/[0-9]/) ) symbolSize +=10;
		if ( password.match(/[a-z]/) ) symbolSize +=26;
		if ( password.match(/[A-Z]/) ) symbolSize +=26;
		if ( password.match(/[^a-zA-Z0-9]/) ) symbolSize +=31;

		// Score
		natLog = Math.log( Math.pow(symbolSize,password.length) );
		score = natLog / Math.LN2;

		// Check
		if (score < 40 ) {
			return "low";
		}
		else if (score < 56 ) {
			return "medium";
		}

		// Strong
		return "high";
	};

	/**
	 * jQuery Password Strength
	 * @version 1.0.0
	 * @date June 30, 2010
     * @package jquery-sparkle {@link http://balupton.com/projects/jquery-sparkle}
	 * @author Benjamin "balupton" Lupton {@link http://balupton.com}
	 * @copyright (c) 2009-2010 Benjamin Arthur Lupton {@link http://balupton.com}
	 * @license MIT License {@link http://creativecommons.org/licenses/MIT/}
	 */
	if ( !($.fn.passwordstrength||false) ) {
		$.fn.passwordstrength = function(options) {
			// Prepare
			var passwordstrength = $.fn.passwordstrength;
			passwordstrength.config = passwordstrength.config || {
				content: '<div class="sparkle-passwordstrength-result"></div><div class="sparkle-passwordstrength-description"></div>',
				contentSelectors: {
					result: '.sparkle-passwordstrength-result',
					description: '.sparkle-passwordstrength-description'
				},
				strengthCss: {
					"short": "invalid",
					mismatch: "invalid",
					username: "invalid",
					low: "low",
					medium: "medium",
					high: "high",
					empty: ""
				},
				il8n: {
					description: "Hint: The password should be have a strength of at least medium. To make it stronger, use upper and lower case letters, numbers and symbols like ! \" ? $ % ^ &amp; ).",
					empty: "Strength indicator",
					username: "Password should not match username",
					mismatch: "Confirm password does not match",
					"short": "Password is too short",
					low: "Weak",
					medium: "Medium",
					high: "Strongest"
				}
			};
			var config = $.extend({}, passwordstrength.config);

			// Options
			$.extend(true, config, options);

			// Fetch
			var $this = $(this);
			var $container = $this.html(config.content).hide();

			// Implode
			var $result = $container.find(config.contentSelectors.result);
			var $description = $container.find(config.contentSelectors.description).html(config.il8n.description);
			if ( !config.il8n.description ) {
				$description.remove();
			}

			// Prepare
			var classes = [
				config.strengthCss["short"],
				config.strengthCss.mismatch,
				config.strengthCss.username,
				config.strengthCss.low,
				config.strengthCss.medium,
				config.strengthCss.high,
				config.strengthCss.empty
			].join(' ');

			// Fetch
			var $password = $(config.password),
				$confirm = $(config.confirm||null),
				$username = $(config.username||null);

			// Apply
			var check = function(){
				// Fetch
				var password = $password.val(),
					confirm  = $confirm.val(),
					username = $username.val();

				// Strength
				var strength = password ? password.passwordstrength(confirm,username) : "empty";
				var strength_css = config.strengthCss[strength];
				var strength_text = config.il8n[strength];

				// Apply
				$result.removeClass(classes).addClass(strength_css).html(strength_text);
			};
			$password
				.keyup(function(){
					var $password = $(this);
					$confirm.val('');
					if ( $password.val() !== '' && !$container.data('shown') ) {
						$container.animate({'height':'show','opacity':'show'},'slow').data('shown',true);
					}
				});
			$password.add($confirm).add($username).keyup(check);
			check();

			// Chain
			return $this;
		}
	}
	else {
		window.console.warn("$.fn.passwordstrength has already been defined...");
	}


})(jQuery);