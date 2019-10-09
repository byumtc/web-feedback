'use strict';

var feedback = function() {
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	function appendHtml(element, html) {
		var div = document.createElement('div');
		div.innerHTML = html;
		while (div.children.length) {
			element.appendChild(div.children[0]);
		}
	}

	function screenshot(options, callback) {

		/* create the video element and video cover elements and add them to body */
		var modalElem = document.createElement('div');
		modalElem.classList.add('feedback--modal');
		modalElem.id = 'feedback--modal';
		var modalHtml = `
			<!-- Modal content -->
			<div class="feedback--modal-content">
				<span class="feedback--close" id="feedback--close">&times;</span>
				<p>Tell us what we can help you with</p>
				<p>
					<label>
						Email:
						<input type="email" width="100%" placeholder="email@example.com">
					</label>
				</p>
				<p>
					<label>
						Describe your problem:
						<textarea width="100%"></textarea>
					</label>
				</p>

				<p>Screenshot:</p>
				<img id="feedback--screenshot" class="feedback--screenshot">
			</div>`;
		appendHtml(modalElem, modalHtml);
		var videoElem = document.createElement('video');
		videoElem.autoplay = true;
		var videoCoverElem = document.createElement('div');
		videoCoverElem.id = 'video-cover';
		videoElem.id = 'video';
		document.body.appendChild(modalElem);
		document.body.appendChild(videoCoverElem);
		document.body.appendChild(videoElem);

		document.getElementById('feedback--close').addEventListener("click", function(e) {
			modalElem.style.display = "none";
		});

		// When the user clicks anywhere outside of the modal, close it
		window.onclick = function(event) {
			if (event.target == modalElem) {
				modalElem.style.display = "none";
			}
		}

		/* set the default width, height, and image type */
		var pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		var pageHeight = window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;
		var height = options.height || pageHeight;
		var width = options.width || pageWidth;
		var type = options.type || 'image/png';

		/* wait to take the screenshot until the video is actually playing */
		videoElem.addEventListener('playing', function(e) {
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

	/* draw a video to the canvas and return a data url */
	function makeScreenshotFromCanvas(videoElem, height, width, type) {
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		canvas.width = width;
		canvas.height = height;
		ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
		return canvas.toDataURL(type);
	}

	/* our callback */
	function feedbackPopup(url) {
		var img = document.getElementById("feedback--screenshot");
		img.src = url;
		img.alt = url;
		var modal = document.getElementById("feedback--modal");
		modal.style.display = "block";
	}

	return {
		screenshot: screenshot,
		defaultCallback: feedbackPopup
	}
}();

