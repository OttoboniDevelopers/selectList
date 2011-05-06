$(function() {
	$('.site-select').selectList({
		size: 150
	});
	
	$('a').click(function(){
		var clone = $('.site-select').first().clone();
		$('body').append('<hr>',clone);
/* 		clone.selectList(); */
		return false;
	});
});