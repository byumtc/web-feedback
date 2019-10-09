
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenshot(options, callback) {
	var videoElem = document.createElement('video');
	videoElem.autoplay = true;
	var videoCoverElem = document.createElement('div');
	videoCoverElem.id = 'video-cover';
	videoElem.id = 'video';
	document.body.appendChild(videoCoverElem);
	document.body.appendChild(videoElem);
	var pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var pageHeight = window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;
	var height = options.height || pageHeight;
	var width = options.width || pageWidth;
	videoElem.addEventListener('playing', async function(e) {
		if (videoElem.readyState === 4) {
			/* get the base64 url for our canvas image */
			var url = makeScreenshotFromCanvas(videoElem, height, width);

			/* stop screen recording */
			let tracks = videoElem.srcObject.getTracks();
			tracks.forEach(track => track.stop());
			videoElem.srcObject = null;
			document.body.removeChild(videoElem);
			document.body.removeChild(videoCoverElem);

			/* call the callback */
			callback(url);
		}
	});
	/* screen capture options */
	var displayMediaOptions = {
			video: {
				cursor: "never"
			},
			audio: false
	};
	/* start the screen capture */
	navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
	.then(function(stream) {
		videoElem.srcObject = stream;
	}).catch(function(err) {
		console.log(err);
	});
}

function makeScreenshotFromCanvas(videoElem, height, width) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = width;
	canvas.height = height;
	ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
	return canvas.toDataURL('image/jpeg');
}

function feedbackPopup(url) {
	var img = document.getElementById("screenshot-img");
	img.src = url;
	img.alt = url;
	var modal = document.getElementById("myModal");
	modal.style.display = "block";
}

document.addEventListener('DOMContentLoaded', function() {
	var modal = document.getElementById("myModal");
	var img = document.getElementById("screenshot-img");

	document.getElementById('close-modal').addEventListener("click", function(e) {
		modal.style.display = "none";
	});
		
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}

	const startElem = document.getElementById("start");

	// Set event listeners for the start and stop buttons
	startElem.addEventListener("click", function(evt) {
		var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		var height = window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;
		var options = {
			width,
			height
		};
		screenshot(options, function(url) {
			feedbackPopup(url);
		});
	}, false);
});

