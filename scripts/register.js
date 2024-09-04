document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('reg_username').focus();
});

document.getElementById("register-btn").addEventListener("click", handleRegister);

function registerUserFn() {
    return new Promise((resolve, reject) => {
        const username = document.getElementById("reg_username").value;
        const password = document.getElementById("reg_password").value;

        if (!username || !password) {
            showCustomAlert("error", "Username or Password cannot be empty.");
            reject(new Error("Username or Password cannot be empty."));
            return;
        }

        chrome.runtime.sendMessage(
            {action: "registerUser", username, password},
            (response) => {
                console.log("Response: ", response);
                if (chrome.runtime.lastError) {
                    console.error("Runtime error:", chrome.runtime.lastError);
                    showCustomAlert("error", "An error occurred during registration. \n\n" + chrome.runtime.lastError.message);
                    reject(chrome.runtime.lastError);
                } else if (response.error) {
                    console.error("Register error:", response.error);
                    showCustomAlert("error", "Failed to register. \n\n" + response.error);
                    reject(new Error(response.error));
                } else if (response.userId) {
                    chrome.storage.local.set({ user_id: response.userId }, () => {
                        showCustomAlert("success", "User registered successfully!");
                        resolve(response.userId);
                        setTimeout(() => {
                            window.close();
                        }, 1500);
                    });

                    const sessionDuration = 60 * 60 * 1000;
                    setTimeout(() => {
                        chrome.storage.local.remove('user_id', () => {
                            console.log("Session has expired and user_id has been removed.");
                        });
                    }, sessionDuration);
                } else {
                    console.error("Unexpected response:", response);
                    showCustomAlert("error", "Unexpected response from server.");
                    reject(new Error("Unexpected response"));
                }
            });
    });
}

async function handleRegister() {
    try {
        const userId = await registerUserFn();
        if (userId) {
            console.log("Register successful, user ID:", userId);
        }
    } catch (error) {
        console.error("Register error:", error);
    }
}

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
    }, 2000);
}

function closeCustomAlert() {
    const alertBox = document.getElementById("custom-alert");
    alertBox.style.display = "none";
}

const closeBtn = document.getElementById("close-btn");
if (closeBtn) {
    closeBtn.addEventListener('click', closeCustomAlert);
} else {
    console.error("Close button not found");
}