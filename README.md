# web-feedback

Javascript module to get feedback from users.

Features:

- [x] Works with Ionic 4
- [x] Takes a screenshot of the page (with permission from the user)
- [x] Opens up a modal with a couple forms to fill out
- [x] Posts the form data (converted to JSON) to an endpoint you provide

Drawbacks:

- The user has to select the screen they want to screenshot

# Usage

It's pretty easy to use. 

If you're using Typescript:

```typescript
import { doFeedback, FeedbackOptions } from "web-feedback";

const feedbackOptions = new FeedbackOptions({
  endpoint: endpoint
});

doFeedback(feedbackOptions);
```

If you're using Javascript:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  const feedbackOptions = new FeedbackOptions({
    endpoint: endpoint
  });
  document.getElementById("do-feedback").addEventListener("click", function(evt) {
    feedback.doFeedback(feedbackOptions);
  }, false);
});
```

# FeedbackOptions
```javascript
var feedbackOptions = new FeedbackOptions({
    endpoint: endpoint,
    additionalInfo: additionalInfo,
    modalTemplate: modalTemplate,
    screenshotOptions: screenshotOptions
    callback: callback
});
```

### endpoint
a URl to POST the feedback to. The structure of the data (JSON) in the POST request will look like this:
```JSON
{
  "email": "name@example.com",
  "description": "",
  "screenshot": "data:image/png;base64,iVBORw0..............."
}
```

### additionalInfo
An object containing any additional information you want to include in the POST request.

### modalTemplate
A string of html markup that will be used for the feedback modal that the user sees. Here's the default:
```html
<div class="feedback--modal-content">
  <form action="" id="feedback--form" class="feedback--form">
    <span class="feedback--close" id="feedback--close">&times;</span>
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
</div>
```
**Warning: this will probably break if you don't have the right classes/ids in your template.** 

Here's a minimum that you can start from and add to:
```html
<div class="feedback--modal-content">
  <form id="feedback--form">
    <span class="feedback--close" id="feedback--close">&times;</span>
    
    <!--Here's where you could put all your <input> tags and whatnot-->
    
    <img class="feedback--screenshot" id="feedback--screenshot">
    <button id="feedback--submit-btn">Submit</button>
  </form>
</div>
```
### callback
If you need more control over things, you can add a callback. This callback is a replacement for
posting the JSON. Without a callback, this is what the "feedback flow" looks like:
```
user clicks feedback --> modal pops up --> user fills out and submits form --> form data is posted to endpoint
```
If you specify a callback function, you get the formdata passed to the callback right after the user submits it.
```
user clicks feedback --> modal pops up --> user fills out and submits form --> callback
```
## screenshotOptions: ScreenshotOptions
```javascript
var screenshotOptions = new ScreenshotOptions({
  width: width,
  height: height,
  type: 'image/png'
});
```
Default image type is 'image/png'.

Default height and width are the height and width of the window.
# Examples

see [examples](./examples)

# License

See [LICENSE](https://github.com/byumtc/web-feedback/blob/master/LICENSE)
