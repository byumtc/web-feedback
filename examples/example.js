// demo.js
// 
// This is a demo of ./feedback.js.
//
// It listens for a button click and then takes a screenshot of the page
// Then it shows a modal with some fields to fill out
//
document.addEventListener('DOMContentLoaded', function() {
	var feedbackOptions = new feedback.FeedbackOptions({
		endpoint: 'http://localhost:1234'
	});
	document.getElementById("do-feedback").addEventListener("click", function(evt) {
		feedback.doFeedback(feedbackOptions);
	}, false);
});
