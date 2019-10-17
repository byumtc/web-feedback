'use strict';

var feedback = function() {
  class FeedbackOptions {
    constructor(options) {
      options = options || {};
      this.endpoint = options.endpoint;
      this.modalTemplate = options.modalTemplate;
      this.screenshotOptions = options.screenshotOptions;
      this.additionalInfo = options.additionalInfo || {};
      this.callback = options.callback;
    }
  }

  class ScreenshotOptions {
    constructor(options) {
      this.width = options.width;
      this.height = options.height;
      this.type = options.type;
    }
  }

  function doFeedback(feedbackOptions) {
    if (!feedbackOptions) {
      feedbackOptions = {};
    }
    if (!feedbackOptions.callback && !feedbackOptions.endpoint) {
      throw new Error("You have to provide a callback or an endpoint.");
    }
    var modalTemplate = feedbackOptions.modalTemplate || defaultModalTemplate;
    showInstructions(function(action) {
      setupFeedbackModal(modalTemplate);

      takeScreenshot(feedbackOptions.screenshotOptions, function(url) {
        showFeedbackModal(url);

        document.getElementById('feedback--submit-btn').addEventListener("click", function(e) {
          handleFeedbackSubmit(feedbackOptions, url);
        });
      });
    });
  }

  function handleFeedbackSubmit(feedbackOptions, screenshotUrl) {
    var form = document.getElementById('feedback--form');
    var formData = {
      screenshot: screenshotUrl
    };
    var elems = form.querySelectorAll('input, textarea');
    elems.forEach(function(element) { 
      formData[element.name] = element.value;
    });
    Object.assign(formData, feedbackOptions.additionalInfo);

    if (typeof feedbackOptions.callback === 'function') {
      callback(formData);
    } else {
      /* send json post request to endpoint */
      var http = new XMLHttpRequest();
      http.open('POST', feedbackOptions.endpoint, true);
      http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
          /* all done ! */
          /* cleanup */
          document.body.removeChild(document.getElementById('feedback--modal'));
        }
      }
      var text = JSON.stringify(formData);
      http.send(text);
    }
  }

  function appendHtml(element, html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    while (div.children.length) {
      element.appendChild(div.children[0]);
    }
  }

  function buildInstructionsModal(modalTemplate) {
    var modalElem = document.getElementById('feedback--instructions-modal');
    /* create the modal from the template and append it to the body */
    if (!modalElem) {
      modalElem = document.createElement('div');
      modalElem.classList.add('feedback--modal');
      modalElem.id = 'feedback--instructions-modal';
      modalElem.style.display = "none";
      appendHtml(modalElem, modalTemplate);
      document.body.appendChild(modalElem);
    }
    return modalElem;
  }

  function showInstructions(callback) {
    var modalElem = buildInstructionsModal(instructionsModalTemplate);
    modalElem.style.display = "block";

    /* close modal when they click the 'X' */
    document.getElementById('feedback--instructions-close').addEventListener("click", function(e) {
      document.body.removeChild(modalElem);
      modalElem.style.display = "none";
      callback('exited');
    });

    /* also close the modal when they click anywhere outside of it */
    window.onclick = function(event) {
      if (event.target == modalElem) {
        document.body.removeChild(modalElem);
        modalElem.style.display = "none";
        callback('exited');
      }
    }

    document.getElementById('feedback--btn-acknowledge').addEventListener("click", function(e) {
      document.body.removeChild(modalElem);
      modalElem.style.display = "none";
      callback('acknowledged');
    });
  }

  var instructionsModalTemplate = `
    <div class="feedback--modal-content">
      <span class="feedback--close" id="feedback--instructions-close">&times;</span>
      <p>Your browser is going to ask you which screen to share. There will be three options:</p>
        <ul>
          <li>Your Entire Screen</li>
          <li>Application Window</li>
          <li>Chrome Tab</li>
        </ul>
      <p>Choose "Chrome Tab", and then select the current tab you're in (usually the top one).</p>
      <p>Then, click "Share"</p>
      <button type="button" class="feedback--btn" id="feedback--btn-acknowledge">Got it</button>
    </div>`;

  var defaultModalTemplate = `
    <div class="feedback--modal-content">
      <span class="feedback--close" id="feedback--close">&times;</span>
      <form action="" id="feedback--form" class="feedback--form">
        <p>Tell us what we can help you with</p>
        <p>
          <label for="feedback--email">Email address</label>:
          <input id="feedback--email" class="feedback--input feedback--input-text" name="email" type="email" width="100%" placeholder="email@example.com">
        </p>
        <p>
          <label for="feedback--description">Describe your problem:</label>
          <textarea id="feedback--description" class="feedback--input feedback--textarea" width="100%" name="description"></textarea>
        </p>

        <p>Screenshot:</p>
        <img id="feedback--screenshot" class="feedback--screenshot">

        <p><button id="feedback--submit-btn" type="submit" class="feedback--btn">Submit</button></p>
      </form>
    </div>`;

  function takeScreenshot(screenshotOptions, callback) {
    if (!screenshotOptions) {
      screenshotOptions = {};
    }

    /* set the width, height, and image type */
    var pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var pageHeight = window.innerHeight|| document.documentElement.clientHeight || document.body.clientHeight;
    var height = screenshotOptions.height || pageHeight;
    var width = screenshotOptions.width || pageWidth;
    var type = screenshotOptions.type || 'image/png';

    /* create a div to cover the video element so we won't see it */
    var videoCoverElem = document.createElement('div');
    videoCoverElem.classList.add('feedback--video-cover');
    document.body.appendChild(videoCoverElem);

    /* create video element we're going to take a screenshot of */
    var videoElem = document.createElement('video');
    videoElem.classList.add('feedback--video');
    videoElem.autoplay = true;
    document.body.appendChild(videoElem);

    /* wait until the video is actually playing until we take a screenshot of it */
    videoElem.addEventListener('playing', function(e) {

      /* see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState */
      if (videoElem.readyState === 4) {

        /* get the base64 url for our canvas image */
        var url = makeScreenshotFromCanvas(videoElem, height, width);

        /* stop screen recording */
        let tracks = videoElem.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoElem.srcObject = null;

        /* clean up the dom (remove video and video cover elems) */
        document.body.removeChild(videoElem);
        document.body.removeChild(videoCoverElem);

        /* pass the screenshot url to the callback */
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

    /* start the screen capture
     * FIXME: do something if we get permission denied or some other error
     */
    navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
      .then(function(stream) {
        videoElem.srcObject = stream;
      }).catch(function(err) {
        /* clean up the dom (remove video and video cover elems) */
        document.body.removeChild(videoElem);
        document.body.removeChild(videoCoverElem);
        /* pass the screenshot url (in this case, null) to the callback */
        callback(null);
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

  function setupFeedbackModal(modalTemplate) {

    /* create the modal from the template and append it to the body */
    var modalElem = document.createElement('div');
    modalElem.classList.add('feedback--modal');
    modalElem.id = 'feedback--modal';
    modalElem.style.display = "none";
    appendHtml(modalElem, modalTemplate);
    document.body.appendChild(modalElem);

    /* prevent form submission via the normal method */
    var form = document.getElementById('feedback--form');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });

    /* close modal when they click the 'X' */
    document.getElementById('feedback--close').addEventListener("click", function(e) {
      modalElem.style.display = "none";
    });

    /* also close the modal when they click anywhere outside of it */
    window.onclick = function(event) {
      if (event.target == modalElem) {
        modalElem.style.display = "none";
      }
    }
  }

  function showFeedbackModal(screenshotUrl) {
    var modalElem = document.getElementById("feedback--modal");
    var img = document.getElementById("feedback--screenshot");

    /* add screenshot to modal */
    img.src = screenshotUrl;
    img.alt = screenshotUrl;

    /* display the modal */
    modalElem.style.display = "block";
  }

  return {
    takeScreenshot: takeScreenshot,
    showFeedbackModal: showFeedbackModal,
    FeedbackOptions: FeedbackOptions,
    ScreenshotOptions: ScreenshotOptions,
    doFeedback: doFeedback
  }
}();

if (typeof module !== typeof undefined) {
  module.exports = feedback;
}
