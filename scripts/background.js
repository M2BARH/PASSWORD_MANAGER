// Communicate with the backend server
function storePassword(data) {
  fetch("http://localhost:3000/store-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

function getPassword(data, callback) {
  fetch("http://localhost:3000/get-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then(callback);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "storePassword") {
    storePassword(message.data);
    sendResponse(true);
  } else if (message.action === "getPassword") {
    getPassword(message.data, (response) => {
      sendResponse(response);
    });
    return true; // Keep the messaging channel open for the async response
  }
});
