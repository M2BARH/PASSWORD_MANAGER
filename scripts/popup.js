const toggleIcon = document.getElementById("toggle-icon");
const passwordField = document.getElementById("password");

const isChrome =
  navigator.userAgentData &&
  navigator.userAgentData.brands &&
  navigator.userAgentData.brands.some(
    (brand) => brand.brand === "Google Chrome"
  );

if (isChrome) {
  toggleIcon.style.display = "inline";

  toggleIcon.addEventListener("click", () => {
    if (passwordField.type === "password") {
      passwordField.type = "text";
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
    } else {
      passwordField.type = "password";
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
    }
  });
}

document.getElementById("store").addEventListener("click", () => {
  const site = document.getElementById("site").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  chrome.runtime.sendMessage(
    {
      action: "storePassword",
      data: {
        user_id: 1, // Replace with actual user ID handling
        site,
        username,
        password,
      },
    },
    (response) => {
      if (response) {
        alert("Password stored successfully");
      }
    }
  );
});

document.getElementById("retrieve").addEventListener("click", () => {
  const site = document.getElementById("retrieve-site").value;

  chrome.runtime.sendMessage(
    {
      action: "getPassword",
      data: {
        user_id: 1, // Replace with actual user ID handling
        site,
      },
    },
    (response) => {
      const passwordList = document.getElementById("password-list");
      passwordList.innerHTML = "";

      if (Array.isArray(response) && response.length > 0) {
        response.forEach((entry) => {
          const listItem = document.createElement("li");
          listItem.innerText = `Site: ${entry.site} \n Username: ${entry.username} \n Password: ${entry.password}`;
          listItem.addEventListener("click", () =>
            autofillPassword(entry.username, entry.password)
          );
          passwordList.appendChild(listItem);
        });
      } else {
        const listItem = document.createElement("li");
        listItem.innerText = "Password not found";
        passwordList.appendChild(listItem);
      }
    }
  );
});

function autofillPassword(username, password) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "autofill",
      username,
      password,
    });
  });
}
