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
  endpoint: endpoint,
  additionalInfo: additionalInfo
});

doFeedback(feedbackOptions);
```

If you're using Javascript:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  var feedbackOptions = new feedback.FeedbackOptions(
    /* endpoint */ 'http://0.0.0.0:1234',
    /* additionalInfo */ {},    
  );
  document.getElementById("do-feedback").addEventListener("click", function(evt) {
    feedback.doFeedback(feedbackOptions);
  }, false);
});
```

# Examples

see [examples](./examples)
