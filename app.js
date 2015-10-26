(function ($) {
	// hide all articles
	$(".entries article").each(function (index, element) {
		var article = $(this);
		article.addClass('disclosure_control');
		article.addClass('collapse');
	});

	// toggle articles when clicked
	$(".entries article").click(function () {
		$(this).toggleClass('collapse');
	});
})(jQuery);


