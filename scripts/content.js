chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "autofill") {
    const { username, password } = message;

    const usernameField = document.querySelector(
      'input[type="text"], input[type="email"]'
    );
    const passwordField = document.querySelector('input[type="password"]');

    if (usernameField) {
      usernameField.value = username;
      usernameField.setAttribute('value', username);
      triggerEvents(usernameField);
      updateClass(usernameField);
    }
    
    if (passwordField) {
      passwordField.value = password;
      passwordField.setAttribute('value', password);
      triggerEvents(passwordField);
      updateClass(passwordField);
    }
  }
});

function updateClass(element) {
  setTimeout(() => {
    element.classList.remove('ng-untouched', 'ng-pristine', 'ng-invalid');
    element.classList.add('ng-touched', 'ng-dirty', 'ng-valid');
  }, 100);
}

function triggerEvents(element) {
  const events = ['input', 'change'];
  events.forEach(eventType => {
    const event = new Event(eventType, { bubbles: true });
    element.dispatchEvent(event);
  });
}
