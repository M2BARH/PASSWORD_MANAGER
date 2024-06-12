chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "autofill") {
    const { username, password } = message;

    const usernameField = document.querySelector(
      'input[type="text"], input[type="email"]'
    );
    const passwordField = document.querySelector('input[type="password"]');

    if (usernameField) usernameField.value = username;
    if (passwordField) passwordField.value = password;
  }
});
