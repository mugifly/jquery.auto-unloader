/**
 * jquery.auto-unloader	- v1.0.0 (alpha)
 * (c) Masanori Ohgita - 2014.
 * https://github.com/mugifly/jquery.auto-unloader/
 * License: MIT
**/

(function($){

	/**
		The container object
	**/

	// Constructor
	var AutoUnloader = function( $obj, options ){
		this.tagNames = ['img'];
		this.$dom = $obj;
		this.timer = null;
		this.preloadImages = {};

		(function(instance){
			jQuery(window).bind('load DOMNodeInserted scroll resize', function(e){
				if (instance.timer == null) {
					instance.timer = window.setTimeout(function(){
						instance.check();
						instance.timer = null;
					}, 500);
				}
			});
		})(this);
	};
	
	// Check for image elements
	AutoUnloader.prototype.check = function( opt_container ){

		var tags = this.$dom.find('img');
		for (var j = 0; j < tags.length; j++) {
			var tag = $(tags[j]);
			if (tag.data('src') != null && tag.data('src') != "") {
				// Preload
				var src = tag.data('src');
				tag.data('src', '');
				(function(tag, src, instance){
					if (instance.preloadImages[src] == null) {
						var $img = $('<img/>');
						$img.attr('src', src);
						tag.attr('src', '');

						$img.bind('load', function(){
							instance.preloadImages[src].is_load = true;
							console.log("Prefetched and apply to inview element: " + tag.attr('id'));
							tag[0].src = $img[0].src;

							instance.preloadImages[src] = {};
						});

						instance.preloadImages[src] = {
							'image': $img[0],
							'is_load': false
						};
					} else {
						if (instance.preloadImages[src].is_load == true) {
							console.log("Load from prefetched image: " + tag.attr('id'));
							tag[0].src = instance.preloadImages[src].image.src;
						} else {
							$(instance.preloadImages[src].image).bind('load', function(e) {
								var $prefetched_img = $(e.target);
								console.log("Load from prefetched image (lazy): " + tag.attr('id'));
								tag[0].src = $prefetched_img[0].src;
							});
						}
					}
				})(tag, src, this);
			}

			if (this.isInview(tag)) { // In of the view
				if ((tag.attr('src') == null || tag.attr('src') == "") && tag.data('isrc') != null) {
					// Load to the DOM
					var src = tag.data('isrc');
					console.log("Load: " + tag.attr('id'));
					tag.attr('src', src);
					
					tag.fadeTo(500, 1.0, function(){
						tag.css('width', '');
						tag.css('height', '');
					});
				}
			} else { // Out of the view
				if (tag.attr('src') != null && tag.attr('src') != "") {
					// Remember the element
					if (tag.data('isrc') == null || tag.data('isrc') == '') {
						tag.data('isrc', tag.attr('src'));
					}
					console.log("Unload: " + tag.attr('id'));
					var width = tag.width();
					var height = tag.height();
					// Unload from the DOM
					tag.attr('src', '');
					if (width != 0) {
						tag.css('width', width);
					}
					if (height != 0) {
						tag.css('height', height);
					}
					tag.css('opacity', 0.0);
				}
			}
		}
	};

	// Check whether the view contains in the view of browser
	AutoUnloader.prototype.isInview = function( $obj ) {
		//console.log($(window).scrollTop() + ' < ' + $obj.offset().top);
		if (
		(
			$(window).scrollTop() < $obj.offset().top
			|| $(window).scrollTop() < $obj.offset().top + $obj.height()
		)
		 && $obj.offset().top + $obj.height() < $(window).scrollTop() + $(window).height()) {
			return true; // In of the view
		}
		if ($(window).scrollTop() < $obj.offset().top && $obj.offset().top < $(window).scrollTop() + $(window).height()) {
			return true; // In of the view
		}
		return false;
	};

	/**
		The definition of the jQuery plug-in
	**/
	
	$.fn.applyAutoUnloader = function( config ){
		var defaults = {
			isInline: false
		};
		var options = $.extend(defaults, config);
		return this.each(function(i){
			var obj = new AutoUnloader( $(this), options );
		});
	};
})(jQuery);