document.addEventListener('DOMContentLoaded', function () {
    const authButton = document.getElementById('auth-button');
    const mainContent = document.getElementById('main-content');

    function updateAuthButton() {
        chrome.storage.local.get(['user_id'], function (result) {
            if (result.user_id) {
                authButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                authButton.style.backgroundColor = '#a30909';
                authButton.style.marginBottom = '8px';

                mainContent.style.display = 'block';
            } else {
                authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                authButton.style.backgroundColor = '#007bff';

                mainContent.style.display = 'none';
            }
        });
    }

    authButton.addEventListener('click', function () {
        chrome.storage.local.get(['user_id'], function (result) {
            if (result.user_id) {
                chrome.storage.local.remove('user_id', function () {
                    updateAuthButton();
                });
            } else {
                chrome.tabs.create({url: chrome.runtime.getURL("../html/login.html")});
            }
        });
    });

    updateAuthButton();
});

const toggleIcon = document.getElementById("toggle-icon");
const passwordField = document.getElementById("password");

const isChrome = navigator?.userAgentData?.brands?.some(
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
    chrome.storage.local.get("user_id", async (result) => {
        if (!result.user_id) {
            const userId = chrome.tabs.create({url: chrome.runtime.getURL("../html/login.html")});
            if (userId) {
                storePassword();
            }
        } else {
            storePassword();
        }
    });
});

function storePassword() {
    const site = document.getElementById("site").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        showCustomAlert(
            "error",
            "Username and Password cannot be empty"
        );
        return;
    }

    chrome.runtime.sendMessage(
        {
            action: "storePassword",
            data: {
                site,
                username,
                password,
            },
        },
        (response) => {
            if (response) {
                alert(response.message || "Password stored successfully");
            } else {
                showCustomAlert(
                    "error",
                    "An error occurred while storing the password"
                );
            }
        }
    );
}

document.getElementById("retrieve").addEventListener("click", retrievePassword);

document.getElementById("retrieve-site").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        retrievePassword();
    }
});

function retrievePassword() {
    chrome.storage.local.get("user_id", async (result) => {
        if (!result.user_id) {
            const userId = chrome.tabs.create({url: chrome.runtime.getURL("../html/login.html")});
            if (userId) {
                fetchPassword();
            }
        } else {
            fetchPassword();
        }
    });
}

function fetchPassword() {
    const site = document.getElementById("retrieve-site").value;

    chrome.runtime.sendMessage(
        {
            action: "getPassword",
            data: {
                site,
            },
        },
        (response) => {
            if (chrome.runtime.lastError) {
                console.error("Runtime error:", chrome.runtime.lastError);
                showCustomAlert(
                    "error",
                    "An error occurred while retrieving the password"
                );
                return;
            }

            if (response.error) {
                showCustomAlert("error", response.error);
                return;
            }

            const passwordList = document.getElementById("password-list");
            passwordList.innerHTML = "";

            if (Array.isArray(response) && response.length > 0) {
                response.forEach((entry) => {
                    const listItem = document.createElement("li");
                    listItem.innerHTML = `Site: ${entry.site} <br> Username: ${entry.username} <br> Password: ********** <button class="edit-btn">Edit</button> <button class="delete-btn">Delete</button>`;
                    listItem.addEventListener("click", () =>
                        autofillPassword(entry.username, entry.password)
                    );
                    passwordList.appendChild(listItem);

                    listItem.querySelector(".edit-btn").addEventListener("click", () => {
                        editPassword(entry);
                    });

                    listItem
                        .querySelector(".delete-btn")
                        .addEventListener("click", () => {
                            if (confirm("Are you sure you want to delete this password?")) {
                                deletePassword(entry);
                            }
                        });
                });
            } else {
                const listItem = document.createElement("li");
                listItem.innerText = "Password not found";
                passwordList.appendChild(listItem);
            }
        }
    );
}

function editPassword(entry) {
    const newPassword = prompt("Enter new password:", entry.password);
    if (newPassword && newPassword !== entry.password) {
        chrome.runtime.sendMessage(
            {
                action: "editPassword",
                data: {
                    site: entry.site,
                    username: entry.username,
                    newPassword,
                },
            },
            (response) => {
                if (response) {
                    showCustomAlert("success", "Password updated successfully");
                    retrievePassword();
                }
            }
        );
    }
}

function deletePassword(entry) {
    chrome.runtime.sendMessage(
        {
            action: "deletePassword",
            data: {
                site: entry.site,
                username: entry.username,
            },
        },
        (response) => {
            if (response) {
                showCustomAlert("success", "Password deleted successfully");
                retrievePassword();
            }
        }
    );
}

function autofillPassword(username, password) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "autofill",
            username,
            password,
        });
    });

    window.close();
}

document.addEventListener('DOMContentLoaded', function () {
    const closeBtn = document.getElementById('closeBtn');

    closeBtn.addEventListener('click', closeCustomAlert);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeCustomAlert();
        }
    });
});

function showCustomAlert(type, message) {
    const alertBox = document.getElementById("custom-alert");
    const alertContent = document.getElementById("custom-alert-content");
    const alertMessage = document.getElementById("alert-message");

    alertMessage.textContent = message;

    alertContent.classList.remove("success", "error");
    if (type === "success") {
        alertContent.classList.add("success");
    } else if (type === "error") {
        alertContent.classList.add("error");
    }

    alertBox.style.display = "flex";
    setTimeout(() => {
        alertContent.classList.add("fade-out");
        setTimeout(() => {
            closeCustomAlert();
            alertContent.classList.remove("fade-out");
        }, 300);
    }, 4000);
}

function closeCustomAlert() {
    const alertBox = document.getElementById("custom-alert");
    alertBox.style.display = "none";
}
