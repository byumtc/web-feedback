// demo.js
// 
// This is a demo of ./feedback.js.
//
// It listens for a button click and then takes a screenshot of the page
// Then it shows a modal with some fields to fill out
//
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById("start").addEventListener("click", function(evt) {
		var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		var height = window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;
		// options for the size and type of our screenshot
		var options = {
			width,
			height,
			type: 'image/png'
		};
		// take a screenshot
		feedback.screenshot(options, function(url) {
			// do something with the screenshot
			// feedback.defaultCallback will open up a modal
			// with some fields to fill out
			feedback.defaultCallback(url);
		});
	}, false);
});
